<template>
  <a-row :gutter="10">
      <a-card :bordered="false">
          <!-- 功能区域 -->
        <div class="table-page-toolbar">
          <a-popover title="" placement="bottomLeft" trigger="click" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-view">
            <template #content>
              <dynamic-view-list @change="handleFieldChanged"></dynamic-view-list>
            </template>
            <a-button type="default" icon="double-right">当前视图</a-button>
          </a-popover>

          <a-popover title="字段配置" placement="bottomLeft" trigger="click" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-field">
            <template #content>
              <dynamic-field-list ref="field" :columns="columns" :settingColumns="tableConfig.settingColumns" @change="handleFieldChanged"></dynamic-field-list>
            </template>
            <a-button type="primary" icon="setting">字段配置</a-button>
          </a-popover>

          <a-popover title="筛选" placement="bottomLeft" trigger="click" @visibleChange="filterVisibleChange" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-filter">
            <template #content>
              <dynamic-filter-query ref="filter" :fieldList="superQueryFieldList" :queryParamsModel="tableConfig.queryParamsModel" @handleSuperQuery="handleSuperQuery"/>
            </template>
            <a-button type="primary" icon="filter">筛选</a-button>
          </a-popover>

          <a-popover title="排序" placement="bottom" trigger="click" @visibleChange="sortVisibleChange" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-sort">
            <template #content>
              <dynamic-sort-query ref="sort" :fieldList="superQueryFieldList" :sortParamsModel="tableConfig.sortParamsModel" @handleSortQuery="handleSortQuery"/>
            </template>
            <a-button type="primary" icon="sort">排序</a-button>
          </a-popover>
          
          <span class="btn-right-group">
            <a-button type="primary" icon="plus" @click="handleAdd()">新增</a-button>
          </span>
        </div>

        <div style="margin-top: 15px">
          <a-table
            style="height:500px"
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="tableColumn"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            :rowSelection="{type:'checkbox'}"
            @change="handleTableChange">
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical"/>

            <a-dropdown>
              <a class="ant-dropdown-link">
                更多 <a-icon type="down"/>
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handleEdit(record)">编辑</a>
                </a-menu-item>
                <a-menu-item>
                  <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                    <a>删除</a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
        </span>
          </a-table>
        </div>
        <dynamic-modal ref="modalForm" :columns="formColumns" @ok="modalFormOk"></dynamic-modal>
      </a-card>
  </a-row>
</template>
<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import { filterObj, removeEmptyObject } from '@/utils/util'
  import { handleGetSchema, schemaTransform, handleColumnHrefAndDict } from '@/utils/schema'
  import DynamicModal from '../dynamic/DynamicModal'
  import DynamicViewList from './modules/DynamicViewList'
  import DynamicFieldList from './modules/DynamicFieldList'
  import DynamicFilterQuery from './modules/DynamicFilterQuery';
  import DynamicSortQuery from './modules/DynamicSortQuery'
  import moment from 'moment'

  export default {
    name: 'DynamicList',
    mixins: [JeecgListMixin],
    components: {
      DynamicFilterQuery,
      DynamicModal,
      DynamicFieldList,
      DynamicSortQuery,
      DynamicViewList,
      moment
    },
    data() {
      return {
        disableMixinCreated: true,
        model: {},
        currentRoleId: '',
        queryParam: {},
        tableConfig: {},      //当前视图的设置
        dataSource: [],

        columns: [],
        superQueryFieldList: [],
        tableColumns: [],
        formColumns: [],
        sortColumns: [],
        actionColumn: {
            title: "操作",
            dataIndex: "action",
            scopedSlots: {
                customRender: "action"
            },
            align: "center",
            width: 150
        },
        isorter: {
          column: 'createTime',
          order: 'desc'
        },
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        
        loading: false,
        test:{},
        rightcolval:0,
        
        url: {
          list: '/online/cgform/api/getData/' + this.$route.params.code,
          delete: '/online/cgform/api/form/' + this.$route.params.code + "/:id",
          exportXlsUrl: 'sys/role/exportXls',
          importExcelUrl: 'sys/role/importExcel'
        }
      }
    },
    created() {
      this.loadDynamicData();
    },
    computed: {
      tableColumn: function() {
          var e = this;
          if (!this.settingColumns || this.settingColumns.length <= 0) {
              return this.tableColumns.concat([this.actionColumn]);
          }
          var t = this.tableColumns.filter(function(t) {
              return "rowIndex" == t.key || "action" == t.dataIndex || (t.listShow || t.listShow === undefined)
          });
          return t.concat([this.actionColumn])
      },
    },
    methods: {
      loadDynamicData() {
        var component = this;
        var dynamicId = this.$route.params.code;
        getAction('/online/cgform/api/getColumns/' + dynamicId, {}).then((res) => {
          if (res.success) {
            var collect = {};
            this.columns = res.result.columns.concat([]);        //隔离后用于fieldList
            this.dictOptions = res.result.dictOptions;

            this.settingColumns = [];
            this.tableColumns = res.result.columns
            this.tableColumns.forEach(column => {
              handleColumnHrefAndDict(component, column, collect)
              if (column.scopedSlots === null) {        //组件bug，null会报错
                column.scopedSlots = undefined
              }
            });
            this.loadDynamicConfig();
            this.loadData(1);
          }else{
            this.$message.warning(res.message)
          }
        })
        getAction('/online/cgform/api/getFormItem/' + dynamicId, {}).then((res) => {
          if (res.success) {
            this.formColumns = handleGetSchema(this, res.result.schema)
            this.superQueryFieldList = handleGetSchema(this, res.result.schema)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      loadDynamicConfig() {
        this.tableConfig = this.$ls.get('dynamic-config' + this.url.list)
        if(this.tableConfig == undefined) {
          this.tableConfig = {
            settingColumns: this.initSettingColumns(),
            queryParamsModel: [],
            sortParamsModel: []
          }
        }
      },
      initSettingColumns() {
        return this.columns.map((column) => {
          return {
            dataIndex: column.dataIndex,
            listShow: true
          }
        });
      },
      filterVisibleChange(visible) {
        if(visible) {
          return;
        }
        var param = this.tableConfig.queryParamsModel;
        param = removeEmptyObject(param)
        console.log(param)
        this.handleSuperQuery(param, 'and');
      },
      sortVisibleChange(visible) {
        if(visible) {
          return;
        }
        var param = this.tableConfig.sortParamsModel;
        param = removeEmptyObject(param)
        this.sortParamsModel = param
        console.log(param)

        if (param.length > 0) {
          this.isorter = {column:param[0].field, order:param[0].order};      //其余的前端排序
          this.loadData(1);
        }
      },
      handleResultAfter() {
        var params = this.sortParamsModel;
        if(params != null && params.length > 1) {
          this.dataSource.sort(function(a, b) {
            for(var i = 0; i < params.length; i++) {
              var model = params[i];
              if(a[model.field] == b[model.field]) {
                continue;
              } if (a[model.field] < b[model.field]) {
                return model.order == 'asc' ? -1 : 1;
              } else {
                return model.order == 'asc' ? 1 : -1;
              }
            }
            return 0;
          });
        }
      },
      handleFieldChanged: function(settingColumns) {
        var columns = settingColumns;
        this.tableColumns.sort(function(a, b) {
          return columns.indexOf(a.dataIndex) - columns.indexOf(b.dataIndex);
        })
        this.superQueryFieldList.sort(function(a, b) {
          return columns.indexOf(a.value) - columns.indexOf(b.value);
        });
        //this.tableColumns = this.tableColumns.concat([])

        this.$data.tableColumns = this.tableColumns;
      },
      handleSortQuery() {
      }
    }
  }
</script>

<style>
  .dynamic-popover-overlay-view .ant-popover-inner-content {
    padding: 0;
  }
  .dynamic-popover-overlay-field .ant-popover-inner-content {
    padding: 0 3px;
  }

  @media screen and (max-width: 576px) {
    .dynamic-popover-overlay-filter .ant-popover-content {
      margin: 0 15px;
    }
  }

  @media screen and (max-width: 576px) {
    .dynamic-popover-overlay-sort .ant-popover-content {
      margin: 0 15px;
    }
  }

</style>
<style scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-right: 8px
  }

  .table-page-toolbar {
    display: flex;
  }
  .table-page-toolbar .btn-right-group {
    margin-left: auto;
  }
</style>