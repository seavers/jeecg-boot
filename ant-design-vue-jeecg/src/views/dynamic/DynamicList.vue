<template>
  <a-row :gutter="10">
      <a-card :bordered="false">
          <!-- 功能区域 -->
        <div class="table-page-toolbar">
          <dynamic-view-list :viewId.sync="viewId"></dynamic-view-list>

          <a-popover title="字段配置" placement="bottomLeft" trigger="click" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-field">
            <template #content>
              <dynamic-field-list ref="field" :columns="columns" :settingColumns="tableConfig.settingColumns" @change="handleFieldChanged"></dynamic-field-list>
            </template>
            <a-button type="primary" icon="setting">字段配置</a-button>
          </a-popover>

          <a-popover title="筛选" placement="bottomLeft" trigger="click" @visibleChange="filterVisibleChange" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-filter">
            <template #content>
              <dynamic-filter-query ref="filter" :fieldList="superQueryFieldList" :queryParamsModel="tableConfig.queryParamsModel" @change="changeQueryParamsModel"/>
            </template>
            <a-button type="primary" icon="filter">筛选</a-button>
          </a-popover>

          <a-popover title="排序" placement="bottom" trigger="click" @visibleChange="sortVisibleChange" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-sort">
            <template #content>
              <dynamic-sort-query ref="sort" :fieldList="superQueryFieldList" :sortParamsModel="tableConfig.sortParamsModel" @change="changeSortParamsModel"/>
            </template>
            <a-button type="primary" icon="sort-ascending">排序</a-button>
          </a-popover>
          
          <span class="btn-right-group">
            <a-button type="primary" icon="plus" @click="handleAdd()">新增</a-button>
          </span>
        </div>

        <div style="margin-top: 15px">
          <a-table
            ref="table"
            class="dynamic-table"
            style="height:500px"
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
  import { DynamicTableListMixin } from '@/mixins/DynamicTableListMixin'
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import { filterObj, removeEmptyObject } from '@/utils/util'
  import DynamicModal from '../dynamic/DynamicModal'
  import DynamicViewList from './modules/DynamicViewList'
  import DynamicFieldList from './modules/DynamicFieldList'
  import DynamicFilterQuery from './modules/DynamicFilterQuery';
  import DynamicSortQuery from './modules/DynamicSortQuery'
  import moment from 'moment'

  export default {
    name: 'DynamicList',
    mixins: [JeecgListMixin, DynamicTableListMixin],
    components: {
      DynamicFilterQuery,
      DynamicModal,
      DynamicFieldList,
      DynamicSortQuery,
      DynamicViewList,
      moment
    },
    props: {
    },
    data() {
      return {
        dynamicId: this.$route.params.code,
        viewId: -1,

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
    computed: {
      tableColumn: function() {
          var e = this;
          if (!this.tableConfig.settingColumns || this.tableConfig.settingColumns.length <= 0) {
              return this.tableColumns.concat([this.actionColumn]);
          }

          var settingColumns = this.tableConfig.settingColumns.filter(el=>el.listShow).map(el=>el.dataIndex);
          var t = this.tableColumns.filter(function(t) {
              return "rowIndex" == t.key || "action" == t.dataIndex || !!settingColumns.includes(t.dataIndex)
          });
          return t.concat([this.actionColumn])
      },
    },
    watch: {
      tableConfig: {
        deep: true,
        handler: function(config) {
          this.$ls.set('dynamic:config:' + this.dynamicId + ":" + this.viewId, config)
        }
      },
      viewId: function() {
        this.loadDynamicConfig(true)
      },
    },
    created() {
      this.loadDynamicData();
    },
    methods: {
      loadDynamicData() {
        getAction('/online/cgform/api/getColumns/' + this.dynamicId, {}).then((res) => {
          if (res.success) {
            var fieldHrefSlots = {};
            res.result.fieldHrefSlots.forEach((function(e) {
                return fieldHrefSlots[e.slotName] = e
            }));

            this.columns = res.result.columns.concat([]);        //隔离后用于fieldList
            this.dictOptions = res.result.dictOptions;
            this.handleColumnDictOptions(this.dictOptions);

            this.tableColumns = res.result.columns
            this.tableColumns.forEach(column => {
              Object.keys(column).map((function(e) {
                  null == column[e] && delete column[e]
              }));
              this.handleColumnHrefAndDict(column, fieldHrefSlots)
              this.handleColumnShowLength(column)
            });
            this.loadDynamicConfig(true);
          }else{
            this.$message.warning(res.message)
          }
        })
        getAction('/online/cgform/api/getFormItem/' + this.dynamicId, {}).then((res) => {
          if (res.success) {
            this.formColumns = this.handleGetSchema(this, res.result.schema)
            this.superQueryFieldList = this.handleGetSchema(this, res.result.schema)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      loadDynamicConfig(check) {
        var tableConfig = this.$ls.get('dynamic:config:' + this.dynamicId + ":" + this.viewId)
        if(tableConfig != null) {
          if(check && tableConfig.settingColumns) {     //校验是否有新增的字段
            var settingColumnNames = tableConfig.settingColumns.map(el=>el.dataIndex);
            this.columns.forEach((column) => {
              if(settingColumnNames.indexOf(column.dataIndex) == -1) {
                tableConfig.settingColumns.push({
                  dataIndex: column.dataIndex,
                  listShow: false
                })
              } 
            })
          }
          this.tableConfig = tableConfig;
        } else if(this.columns.length > 0) {
          this.tableConfig = {
            settingColumns: this.columns.map((column) => {
              return {
                dataIndex: column.dataIndex,
                listShow: true
              }
            }),
            queryParamsModel: [],
            sortParamsModel: []
          }
        }

        if(this.tableConfig != null && this.columns.length > 0) {
          this.handleFieldChanged(this.tableConfig.settingColumns);
          this.refreshData();
        }
      },
      changeQueryParamsModel() {
        this.queryParamsModelChanged = true;
      },
      changeSortParamsModel() {
        this.sortParamsModelChanged = true;
      },
      filterVisibleChange(visible) {
        if(visible) {
          return;
        }

        if(this.queryParamsModelChanged) {
          this.queryParamsModelChanged = false;
          this.refreshData();
        }
      },
      sortVisibleChange(visible) {
        if(visible) {
          return;
        }
        if(this.sortParamsModelChanged) {
          this.sortParamsModelChanged = false;
          this.refreshData();
        }
      },
      refreshData() {
        this.sortParamsModel = removeEmptyObject(this.tableConfig.sortParamsModel)
        if (this.sortParamsModel.length > 0) {
          //后端仅支持第一排序字段，其余的前端排序
          this.isorter = {
            column: this.sortParamsModel[0].field,
             order: this.sortParamsModel[0].order
          };
        }

        var superParam = removeEmptyObject(this.tableConfig.queryParamsModel)
        this.handleSuperQuery(superParam, 'and');
      },
      handleFieldChanged: function(settingColumns) {
        var columns = settingColumns.map(el=>el.dataIndex);
        this.tableColumns.sort(function(a, b) {
          return columns.indexOf(a.dataIndex) - columns.indexOf(b.dataIndex);
        })
        this.superQueryFieldList.sort(function(a, b) {
          return columns.indexOf(a.value) - columns.indexOf(b.value);
        });

        //只处理字段显示隐藏和顺序变更，不需要触发loadData()
      },
      handleResultCallback() {
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

  .dynamic-table .dynamic-option {
    display: inline-block;
    padding: 2px 5px;
    border-radius: 5px;
    margin-right: 15px;
    margin-bottom: 5px;
    white-space: nowrap;

  }
</style>