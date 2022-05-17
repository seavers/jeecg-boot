<template>
<div class="j-sort-query-box">
    <a-spin :spinning="loading">
      <a-row>
          <a-form layout="inline">

            <a-row type="flex" drag-target="true" style="margin-bottom:12px" :gutter="16" v-for="(item, index) in sortParamsModel" :key="index">
              <a-icon class="dragbar" type="menu" @mousedown="mouseDown" />

              <a-col class="sort-field">
                <a-tree-select
                  v-model="item.field"
                  :treeData="fieldTreeData"
                  :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
                  placeholder="选择查询字段"
                  allowClear
                  treeDefaultExpandAll
                  :getPopupContainer="node=>node.parentNode"
                  style="width: 100%"
                  @select="(val,option)=>handleSelected(option,item)"
                >
                </a-tree-select>
              </a-col>

              <a-col >
                <a-radio-group v-model="item.order" defaultValue="asc" buttonStyle="solid">
                  <a-radio-button value="asc">正序</a-radio-button>
                  <a-radio-button value="desc">逆序</a-radio-button>
                </a-radio-group>
              </a-col>
              <a-col>
                <a-icon @click="handleDel( index )" type="close" />
              </a-col>
            </a-row>

          </a-form>
      </a-row>
      <a-row>
        <a @click="handleAdd">+ 添加条件</a>
      </a-row>
    </a-spin>
</div>
</template>

<script>
  import moment from 'moment'
  import * as utils from '@/utils/util'
  import { MoveSortMixin } from '@/mixins/MoveSortMixin'

  export default {
    name: 'DynamicSortQuery',
    mixins: [MoveSortMixin],
    components: { },
    props: {
      // columns: {
      //   type: Array
      // },
      sortParamsModel: {
        type: Array,
        default: ()=>[]
      },
      sortColumns: {
        type: Array
      },
      /*
       fieldList: [{
          value:'',
          text:'',
          type:'',
          dictCode:'' // 只要 dictCode 有值，无论 type 是什么，都显示为字典下拉框
       }]
       type:date datetime int number string
      * */
      fieldList: {
        type: Array,
        required: true
      },
      /*
      * 这个回调函数接收一个数组参数 即查询条件
      * */
      callback: {
        type: String,
        required: false,
        default: 'handleSuperQuery'
      },

      // 当前是否在加载中
      loading: {
        type: Boolean,
        default: false
      },

      // 保存查询条件的唯一 code，通过该 code 区分
      // 默认为 null，代表以当前路由全路径为区分Code
      saveCode: {
        type: String,
        default: null
      }

    },
    data() {
      return {
        moment,
        fieldTreeData: [],

        prompt: {
          visible: false,
          value: ''
        },

        visible: false,
        treeIcon: <a-icon type="file-text"/>,
        // 保存查询条件的treeData
        saveTreeData: [],
        // 保存查询条件的前缀名
        saveCodeBefore: 'JSuperQuerySaved_',
        // 查询类型，过滤条件匹配（and、or）
        matchType: 'and',
        superQueryFlag: false,
      }
    },
    computed: {
      izMobile() {
        return this.device === 'mobile'
      },
      tooltipProps() {
        return this.izMobile ? { visible: false } : {}
      },
      fullSaveCode() {
        let saveCode = this.saveCode
        if (saveCode == null || saveCode === '') {
          saveCode = this.$route.fullPath
        }
        return this.saveCodeBefore + saveCode
      },
    },
    watch: {
      // 当 saveCode 变化时，重新查询已保存的条件
      fullSaveCode: {
        immediate: true,
        handler() {
          let list = this.$ls.get(this.fullSaveCode)
          if (list instanceof Array) {
            this.saveTreeData = list.map(i => this.renderSaveTreeData(i))
          }
        }
      },
      fieldList: {
        deep: true,
        immediate: true,
        handler(val) {
          let mainData = [], subData = []
          val.forEach(item => {
            let data = { ...item }
            data.label = data.label || data.text
            let hasChildren = (data.children instanceof Array)
            data.disabled = hasChildren
            data.selectable = !hasChildren
            if (hasChildren) {
              data.children = data.children.map(item2 => {
                let child = { ...item2 }
                child.label = child.label || child.text
                child.label = data.label + '-' + child.label
                child.value = data.value + ',' + child.value
                child.val = ''
                return child
              })
              data.val = ''
              subData.push(data)
            } else {
              mainData.push(data)
            }
          })
          this.fieldTreeData = mainData.concat(subData)
        }
      }
    },

    methods: {
      show() {
        if (!this.sortParamsModel || this.sortParamsModel.length === 0) {
          this.resetLine()
        }
        this.visible = true
      },

      getDictInfo(item) {
        let str = ''
        if(!item.dictTable){
          str = item.dictCode
        }else{
          str = item.dictTable+','+item.dictText+','+item.dictCode
        }
        console.log('高级查询字典信息',str)
        return str
      },
      handleOk() {
        if (!this.isNullArray(this.sortParamsModel)) {
          let event = {
            matchType: this.matchType,
            params: this.removeEmptyObject(this.sortParamsModel)
          }
          // 移动端模式下关闭弹窗
          if (this.izMobile) {
            this.visible = false
          }
          this.emitCallback(event)
        } else {
          this.$message.warn("不能查询空条件")
        }
      },
      emitCallback(event = {}, loadStatus = true) {
        let { params = [], matchType = this.matchType } = event
        this.superQueryFlag = (params && params.length > 0)
        for (let param of params) {
          if (Array.isArray(param.val)) {
            param.val = param.val.join(',')
          }
        }
        console.debug('---高级查询参数--->', { params, matchType })
        this.$emit(this.callback, params, matchType, loadStatus)
      },
      handleCancel() {
        this.close()
      },
      close() {
        this.$emit('close')
        this.$emit('handleSuperQuery', this.sortParamsModel)
        this.visible = false
      },
      handleAdd() {
        this.addNewLine()
      },
      addNewLine() {
        this.sortParamsModel.push({ order: 'asc' })
      },
      resetLine() {
        this.superQueryFlag = false
        this.sortParamsModel = []
        this.addNewLine()
      },
      handleDel(index) {
        this.sortParamsModel.splice(index, 1)
      },
      handleSelected(node, item) {
        let { type, dbType, options, dictCode, dictTable, dictText, customReturnField, popup } = node.dataRef
        item['type'] = type
        item['dbType'] = dbType
        item['options'] = options
        item['dictCode'] = dictCode
        item['dictTable'] = dictTable
        item['dictText'] = dictText
        item['customReturnField'] = customReturnField
        if (popup) {
          item['popup'] = popup
        }
        this.$set(item, 'val', undefined)
      },
      handleOpen() {
        this.show()
      },
      handleOutReset(loadStaus=true) {
        this.resetLine()
        this.emitCallback({}, loadStaus)
      },
      handleReset() {
        this.resetLine()
        this.emitCallback({}, true)
      },
      handleTreeSelect(idx, event) {
        if (event.selectedNodes[0]) {
          let { matchType, records } = event.selectedNodes[0].data.props
          // 将保存的matchType取出，兼容旧数据，如果没有保存就还是使用原来的
          this.matchType = matchType || this.matchType
          this.sortParamsModel = utils.cloneObject(records)
        }
      },



      //SaveTree
      handleSave() {
        let queryParams = this.removeEmptyObject(this.sortParamsModel)
        if (this.isNullArray(queryParams)) {
          this.$message.warning('空条件不能保存')
        } else {
          this.prompt.value = ''
          this.prompt.visible = true
        }
      },
      handlePromptOk() {
        let { value } = this.prompt
        if(!value){
          this.$message.warning('保存名称不能为空')
          return
        }
        // 取出查询条件
        let records = this.removeEmptyObject(this.sortParamsModel)
        // 判断有没有重名的
        let filterList = this.saveTreeData.filter(i => i.originTitle === value)
        if (filterList.length > 0) {
          this.$confirm({
            content: `${value} 已存在，是否覆盖？`,
            onOk: () => {
              this.prompt.visible = false
              filterList[0].records = records
              this.saveToLocalStore()
              this.$message.success('保存成功')
            }
          })
        } else {
          // 没有重名的，直接添加
          this.prompt.visible = false
          // 添加到树列表中
          this.saveTreeData.push(this.renderSaveTreeData({
            title: value,
            matchType: this.matchType,
            records: records
          }))
          // 保存到 LocalStore
          this.saveToLocalStore()
          this.$message.success('保存成功')
        }
      },

      handleRemoveSaveTreeItem(event, vNode) {
        // 阻止事件冒泡
        event.stopPropagation()

        this.$confirm({
          content: '是否删除当前查询？',
          onOk: () => {
            let { eventKey } = vNode
            this.saveTreeData.splice(Number.parseInt(eventKey.substring(2)), 1)
            this.saveToLocalStore()
          },
        })
      },

      // 将查询保存到 LocalStore 里
      saveToLocalStore() {
        let saveValue = this.saveTreeData.map(({ originTitle, matchType, records }) => ({ title: originTitle, matchType, records }))
        this.$ls.set(this.fullSaveCode, saveValue)
      },

      isNullArray(array) {
        //判断是不是空数组对象
        if (!array || array.length === 0) {
          return true
        }
        if (array.length === 1) {
          let obj = array[0]
          if (!obj.field || (obj.val == null || obj.val === '') || !obj.rule) {
            return true
          }
        }
        return false
      },
      // 去掉数组中的空对象
      removeEmptyObject(arr) {
        let array = utils.cloneObject(arr)
        for (let i = 0; i < array.length; i++) {
          let item = array[i]
          if (item == null || Object.keys(item).length <= 0) {
            array.splice(i--, 1)
          } else {
            if (Array.isArray(item.options)) {
              // 如果有字典属性，就不需要保存 options 了
              //update-begin-author:taoyan date:20200819 for:【开源问题】 高级查询 下拉框作为并且选项很多多多 LOWCOD-779
              delete item.options
              //update-end-author:taoyan date:20200819 for:【开源问题】 高级查询 下拉框作为并且选项很多多多 LOWCOD-779
            }
          }
        }
        return array
      },

      /** 渲染保存查询条件的 title（加个删除按钮） */
      renderSaveTreeData(item) {
        item.icon = this.treeIcon
        item.originTitle = item['title']
        item.title = (arg1, arg2) => {
          let vNode
          // 兼容旧版的Antdv
          if (arg1.dataRef) {
            vNode = arg1
          } else if (arg2.dataRef) {
            vNode = arg2
          } else {
            return <span style="color:red;">Antdv版本不支持</span>
          }
          let {originTitle} = vNode.dataRef
          return (
            <div class="j-history-tree-title">
              <span>{originTitle}</span>

              <div class="j-history-tree-title-closer" onClick={e => this.handleRemoveSaveTreeItem(e, vNode)}>
                <a-icon type="close-circle"/>
              </div>
            </div>
          )
        }
        return item
      },

      /** 判断是否允许多选 */
      allowMultiple(item) {
        return item.rule === 'in'
      },

      handleRuleChange(item, newValue) {
        let oldValue = item.rule
        this.$set(item, 'rule', newValue)
        // 上一个规则是否是 in，且type是字典或下拉
        if (oldValue === 'in') {
          if (item.dictCode || item.options instanceof Array) {
            let value = item.val
            if (typeof item.val === 'string') {
              value = item.val.split(',')[0]
            } else if (Array.isArray(item.val)) {
              value = item.val[0]
            }
            this.$set(item, 'val', value)
          }
        }
      },

      handleChangeJPopup(item, e, values) {
        item.val = values[item.popup['destFields']]
      },

      moveSortCall(dragIndex, targetIndex) {
        var drag = this.sortParamsModel[dragIndex];
        if(dragIndex < targetIndex) {
          this.sortParamsModel.splice(targetIndex, 0, drag);
          this.sortParamsModel.splice(dragIndex, 1)
        } else if(dragIndex > targetIndex) {
          this.sortParamsModel.splice(dragIndex, 1)
          this.sortParamsModel.splice(targetIndex, 0, drag);
        }
        console.log(this.sortParamsModel)
      }
    }
  }
</script>

<style lang="less" scoped>

  @media screen and (max-width: 576px) {
    .j-sort-query-box {
      max-width: 292px;
      min-width: 242px;
    }
  }

  @media screen and (min-width: 576px) {
    .j-sort-query-box {
      width: 450px;
    }
  }

  .j-sort-query-box .ant-row-flex {
    align-items: center;
  }

  .j-sort-query-box .ant-form .anticon {
    font-size: 16px;
    padding: 4px;
  }
  .j-sort-query-box .ant-form .sort-field {
    flex-grow: 1;
  }
  .j-sort-query-box .ant-form .anticon.dragbar {
    cursor: pointer;
  }


  .j-super-query-modal {

    .j-super-query-history-card {
      /deep/ .ant-card-body,
      /deep/ .ant-card-head-title {
        padding: 0;
      }

      /deep/ .ant-card-head {
        padding: 4px 8px;
        min-height: initial;
      }
    }

    .j-super-query-history-empty {
      /deep/ .ant-empty-image {
        height: 80px;
        line-height: 80px;
        margin-bottom: 0;
      }

      /deep/ img {
        width: 80px;
        height: 65px;
      }

      /deep/ .ant-empty-description {
        color: #afafaf;
        margin: 8px 0;
      }
    }

    .j-super-query-history-tree {

      .j-history-tree-title {
        width: calc(100% - 24px);
        position: relative;
        display: inline-block;

        &-closer {
          color: #999999;
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 24px;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s, color 0.3s;

          &:hover {
            color: #666666;
          }

          &:active {
            color: #333333;
          }
        }

        &:hover {
          .j-history-tree-title-closer {
            opacity: 1;
          }
        }

      }

      /deep/ .ant-tree-switcher {
        display: none;
      }

      /deep/ .ant-tree-node-content-wrapper {
        width: 100%;
      }
    }

  }

</style>