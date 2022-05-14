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
            :columns="columns"
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
    methods: {
      loadDynamicData() {
        var component = this;
        var dynamicId = this.$route.params.code;
        this.url.list = this.url.list + dynamicId;
        getAction('/online/cgform/api/getColumns/' + dynamicId, {}).then((res) => {
          if (res.success) {
            var collect = {};
            this.columns = res.result.columns.concat([this.actionColumn]);
            this.dictOptions = res.result.dictOptions;
            this.columns.forEach(column => {
              handleColumnHrefAndDict(component, column, collect)
              if (column.scopedSlots === null) {        //组件bug，null会报错
                column.scopedSlots = undefined
              }
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
      },
      executeFilter(param) {
        var param = this.$refs.filter.queryParamsModel;
        param = removeEmptyObject(param)
        console.log(param)
        this.handleSuperQuery(param, 'and');
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