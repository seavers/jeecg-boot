<template>
  <a-row :gutter="10">
    <a-col :md="leftColMd" :sm="24" style="margin-bottom: 20px">

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

          <a-popover title="字段配置" placement="bottom" trigger="click">
            <template #content>
              <j-filter-query :fieldList="superQueryFieldList" @handleSuperQuery="handleSuperQuery"/>
            </template>
            <a-button type="primary" icon="filter">筛选</a-button>
          </a-popover>
          
        </div>

        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <!-- 搜索区域 -->
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="24">
              <a-col :md="12" :sm="8">
                <a-form-item label="角色名称" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <a-input placeholder="" v-model="queryParam.roleName"></a-input>
                </a-form-item>
              </a-col>
              <!--
              <a-col :md="11" :sm="12">
                <a-form-item label="创建时间" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间" ></j-date>
                  <span style="width: 10px;">~</span>
                  <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
                </a-form-item>
              </a-col>
              -->
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="12" :sm="24">
               <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 21px">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin: 5px 0 10px 2px">
          <a-button @click="handleAdd" type="primary" icon="plus">新建角色</a-button>
          <!--<a-button @click="handleEdit(model)" type="primary" icon="plus">角色编辑</a-button>-->
          <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
            <a-button type="primary" icon="import">导入</a-button>
          </a-upload>
          <a-button type="primary" icon="download" @click="handleExportXls('角色管理')">导出</a-button>
        </div>

        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <i class="anticon anticon-info-circle ant-alert-icon">
          </i> 已选择 <a><b>{{ selectedRowKeys.length }}</b></a>项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
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
            <a @click="handleOpen(record)">用户</a>
            <a-divider type="vertical"/>

            <a-dropdown>
              <a class="ant-dropdown-link">
                更多 <a-icon type="down"/>
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handlePerssion(record.id)">授权</a>
                </a-menu-item>
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
        <!-- 右侧的角色权限配置 -->
        <user-role-modal ref="modalUserRole"></user-role-modal>
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
      </a-card>
    </a-col>
    <a-col :md="rightColMd" :sm="24" v-if="this.rightcolval == 1">
      <a-card :bordered="false">
        <div style="text-align: right;">
          <a-icon type="close-circle" @click="hideUserList" />
        </div>
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="24">

              <a-col :md="12" :sm="12">
                <a-form-item label="用户账号">
                  <a-input placeholder="" v-model="queryParam2.username"></a-input>
                </a-form-item>
              </a-col>
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="9" :sm="24">
             <a-button type="primary" @click="searchQuery2" icon="search" style="margin-left: 21px">查询</a-button>
              <a-button type="primary" @click="searchReset2" icon="reload" style="margin-left: 8px">重置</a-button>

            </a-col>
          </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator" :md="24" :sm="24">
          <a-button @click="handleAdd2" type="primary" icon="plus" style="margin-top: 16px">新增用户</a-button>
          <!--<a-button @click="handleEdit2" type="primary" icon="edit" style="margin-top: 16px">用户编辑</a-button>-->
          <a-button @click="handleAddUserRole" type="primary" icon="plus" style="margin-top: 16px">已有用户</a-button>

          <a-dropdown v-if="selectedRowKeys2.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel2">
                <a-icon type="delete"/>
                删除
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 批量操作
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
        </div>
        <!-- table区域-begin -->
        <div>
          <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
            <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
            selectedRowKeys2.length }}</a>项
            <a style="margin-left: 24px" @click="onClearSelected2">清空</a>
          </div>
          <a-table
            style="height:500px"
            ref="table2"
            bordered
            size="middle"
            rowKey="id"
            :columns="columns2"
            :dataSource="dataSource2"
            :pagination="ipagination2"
            :loading="loading2"
            :rowSelection="{selectedRowKeys: selectedRowKeys2, onChange: onSelectChange2}"
            @change="handleTableChange2">
           <span slot="action" slot-scope="text, record">
           <a @click="handleEdit2(record)">编辑</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete2(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
          </a-table>
        </div>
        <!-- 表单区域 -->
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
        <user-modal ref="modalForm2" @ok="modalFormOk2"></user-modal>
        <Select-User-Modal ref="selectUserModal" @selectFinished="selectOK"></Select-User-Modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JFilterQuery from '@/components/jeecg/JFilterQuery.vue';
  import { deleteAction, postAction, getAction } from '@/api/manage'
  import SelectUserModal from '../system/modules/SelectUserModal'
  import RoleModal from '../system/modules/RoleModal'
  import UserModal from '../system/modules/UserModal'
  import { filterObj } from '@/utils/util'
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
        columns:
          [
            {
              title: '角色编码',
              align: 'center',
              dataIndex: 'roleCode'
            },
            {
              title: '角色名称',
              align: 'center',
              dataIndex: 'roleName'
            },
            {
              title: '创建时间',
              dataIndex: 'createTime',
              align:"center",
              sorter: true,
              customRender: (text) => {
                return moment(text).format('YYYY-MM-DD')
              }
            },
            {
              title: '操作',
              dataIndex: 'action',
              align: 'center',
              scopedSlots: { customRender: 'action' }
            }
          ],

        superQueryFieldList: [
          { type: 'input', value: 'username', text: '用户账号', },
          { type: 'input', value: 'realname', text: '用户姓名', },
          { type: 'select', value: 'sex', dbType: 'int', text: '性别', dictCode: 'sex' },
        ],

        url: {
          list: '/sys/role/list',
          delete: '/sys/role/delete',
          addUserRole: '/sys/user/addSysUserRole',
          exportXlsUrl: 'sys/role/exportXls',
          importExcelUrl: 'sys/role/importExcel'
        }
      }
    },
    methods: {
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
      onClearSelected() {
      },

      handleDelete: function(id) {
        this.handleDelete(id)
        this.dataSource2 = []
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
            this.loadData2()
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        })
      },

      handleAddUserRole() {
        if (this.currentRoleId == '') {
          this.$message.error('请选择一个角色!')
        } else {
          this.$refs.selectUserModal.visible = true
        }
      },
      handleOpen(record) {
        this.rightcolval = 1
        this.selectedRowKeys = [record.id]
        this.model = Object.assign({}, record)
        this.currentRoleId = record.id
        this.onClearSelected2()
        this.loadData2()
      },
      /*handleEdit: function(record) {
        if (this.currentRoleId == '') {
          this.$message.error('请选择一个角色!')
        } else {
          this.$refs.modalForm.edit(record)
          this.$refs.modalForm.title = '编辑'
        }
      },*/
      hideUserList(){
        //this.rightcolval = 0
        this.selectedRowKeys = []
      },
      handlePerssion(roleId){
        this.$refs.modalUserRole.show(roleId);
      },
      onChangeFieldShow(checked, ev) {
        console.log(`a-switch to ${checked} ${ev.target}`)
        var index = ev.target.getAttribute('v-data-index')

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