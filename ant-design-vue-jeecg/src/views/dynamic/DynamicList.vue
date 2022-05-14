<template>
  <a-row :gutter="10">
      <a-card :bordered="false">
          <!-- 功能区域 -->
        <div class="table-page-toolbar-wrapper">
          <a-popover title="字段配置" placement="bottom" trigger="click">
            <template #content>
              <a-list :data-source="columns">
                  <a-list-item slot="renderItem" slot-scope="item, index">
                    <a-icon type="menu" />
                    <span>{{ item.title }}</span>
                    <a-switch default-checked @change="onChangeFieldShow" :v-data-index="item.dataIndex"/>
                  </a-list-item>
              </a-list>
              <p><a-button icon="plus">新增字段</a-button></p>
            </template>
            <a-button type="primary" icon="setting">字段配置</a-button>
          </a-popover>

          <a-popover title="字段配置" placement="bottom" trigger="click" @visibleChange="executeFilter">
            <template #content>
              <j-filter-query ref="filter" :fieldList="superQueryFieldList" @handleSuperQuery="handleSuperQuery"/>
            </template>
            <a-button type="primary" icon="filter">筛选</a-button>
          </a-popover>
          
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
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type:'radio'}"
            @change="handleTableChange">
          <span slot="action" slot-scope="text, record">
            <a @click="handleOpen(record)">编辑</a>
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
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
      </a-card>
  </a-row>
</template>
<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JFilterQuery from '@/components/jeecg/JFilterQuery.vue';
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import SelectUserModal from '../system/modules/SelectUserModal'
  import RoleModal from '../system/modules/RoleModal'
  import UserModal from '../system/modules/UserModal'
  import { filterObj, removeEmptyObject } from '@/utils/util'
  import { schemaTransform, handleColumnHrefAndDict } from '@/utils/schema'
  import UserRoleModal from '../system/modules/UserRoleModal'
  import moment from 'moment'

  export default {
    name: 'DynamicList',
    mixins: [JeecgListMixin],
    components: {
      JFilterQuery,
      UserRoleModal,
      SelectUserModal,
      RoleModal,
      UserModal,
      moment
    },
    data() {
      return {
        disableMixinCreated: true,
        model: {},
        currentRoleId: '',
        queryParam: {},
        dataSource: [],
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
        defColumns: [],
        settingColumns: [],
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
        filters: {},
        loading: false,
        selectedRowKeys: [],
        selectionRows: [],
        test:{},
        rightcolval:0,
        columns: [],
        superQueryFieldList: [
        ],

        url: {
          list: '/online/cgform/api/getData/',
          delete: '/sys/role/delete',
          addUserRole: '/sys/user/addSysUserRole',
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
          if (!this.settingColumns || this.settingColumns.length <= 0)
              return this.defColumns;
          var t = this.defColumns.filter(function(t) {
              return "rowIndex" == t.key || "action" == t.dataIndex || !!e.settingColumns.includes(t.dataIndex)
          });
          return t
      },
    },
    methods: {
      loadDynamicData() {
        var component = this;
        var dynamicId = this.$route.params.code;
        this.url.list = this.url.list + dynamicId;
        getAction('/online/cgform/api/getColumns/' + dynamicId, {}).then((res) => {
          if (res.success) {
            var collect = {};
            this.columns = res.result.columns
            this.dictOptions = res.result.dictOptions;

            this.settingColumns = [];
            this.defColumns = res.result.columns.concat([this.actionColumn]);
            this.defColumns.forEach(column => {
              handleColumnHrefAndDict(component, column, collect)
              if (column.scopedSlots === null) {        //组件bug，null会报错
                column.scopedSlots = undefined
              }
              this.settingColumns.push(column.dataIndex)
            });
            this.loadData(1);
          }else{
            this.$message.warning(res.message)
          }
        })
        getAction('/online/cgform/api/getQueryInfo/' + dynamicId, {}).then((res) => {
          if (res.success) {
            this.superQueryFieldList = res.result.map(el => {
              return schemaTransform(el)
            });
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      onClearSelected() {
        this.selectedRowKeys = []
        this.selectionRows = []
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.rightcolval = 1
        this.selectedRowKeys = selectedRowKeys
        this.selectionRows = selectionRows
        this.model = Object.assign({}, selectionRows[0])
        console.log(this.model)
        this.currentRoleId = selectedRowKeys[0]
      },
      handleDelete: function(id) {
        this.handleDelete(id)
        this.currentRoleId = ''
      },
      selectOK(data) {
        let params = {}
        params.roleId = this.currentRoleId
        params.userIdList = []
        for (var a = 0; a < data.length; a++) {
          params.userIdList.push(data[a])
        }
        console.log(params)
        postAction(this.url.addUserRole, params).then((res) => {
          if (res.success) {
            this.loadData()
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        })
      },

      handleOpen(record) {
        this.rightcolval = 1
        this.selectedRowKeys = [record.id]
        this.model = Object.assign({}, record)
        this.currentRoleId = record.id
      },
      handlePerssion(roleId){
        this.$refs.modalUserRole.show(roleId);
      },
      onChangeFieldShow(checked, ev) {
        console.log(`a-switch to ${checked} ${ev.target}`)
        var index = ev.target.getAttribute('v-data-index')
        if (checked) {
          this.settingColumns.indexOf(index) == -1 && this.settingColumns.push(index);
        } else {
          this.settingColumns.indexOf(index) > -1 && this.settingColumns.splice(this.settingColumns.indexOf(index), 1);
        }
      },
      executeFilter(param) {
        var param = this.$refs.filter.queryParamsModel;
        param = removeEmptyObject(param)
        console.log(param)
        this.handleSuperQuery(param, 'and');
      },
      settingColumnsHandler: function(e) {
          var t = this
            , n = vue__WEBPACK_IMPORTED_MODULE_11___default.a.ls.get(this.localCode);
          n && 0 != n.length ? this.settingColumns = n.split(",") : (this.settingColumns = [],
          e.forEach((function(e) {
              t.settingColumns.indexOf(e["dataIndex"]) < 0 && t.settingColumns.push(e["dataIndex"])
          }
          )))
      }
    }
  }
</script>
<style scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-right: 8px
  }
  .ant-popover .ant-popover-inner-content {
    padding: 0;
  }
  .ant-popover-inner-content .ant-list-split .ant-list-item {
    border-bottom: none;
    padding: 4px 4px;
  }
  .ant-popover-inner-content .ant-list-split .ant-list-item:hover {
    background: #eee;
  }
</style>