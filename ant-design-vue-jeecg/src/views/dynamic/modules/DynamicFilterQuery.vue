<template>
<div class="j-super-query-box">
      <a-row>
          <a-form layout="inline">

            <a-row type="flex" style="margin-bottom:10px" :gutter="16" v-for="(item, index) in queryParamsModel" :key="index">

              <a-col :md="8" :xs="24" style="margin-bottom: 12px;">
                <a-tree-select
                  v-model="item.field"
                  :treeData="fieldList"
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

              <a-col :md="6" :xs="24" style="margin-bottom: 12px;">
                <a-select placeholder="匹配规则" :value="item.rule" :getPopupContainer="node=>node.parentNode" @change="handleRuleChange(item,$event)">
                  <a-select-option value="eq">等于</a-select-option>
                  <a-select-option value="like">包含</a-select-option>
                  <a-select-option value="right_like">以..开始</a-select-option>
                  <a-select-option value="left_like">以..结尾</a-select-option>
                  <a-select-option value="in">在...中</a-select-option>
                  <a-select-option value="ne">不等于</a-select-option>
                  <a-select-option value="gt">大于</a-select-option>
                  <a-select-option value="ge">大于等于</a-select-option>
                  <a-select-option value="lt">小于</a-select-option>
                  <a-select-option value="le">小于等于</a-select-option>
                </a-select>
              </a-col>

              <a-col :md="8" :xs="24" style="margin-bottom: 12px;">
                <dynamic-element :item="findItem(item.field)" :rule="item.rule" :value.sync="item.val"></dynamic-element>
              </a-col>

              <a-col :md="2" :xs="0" style="margin-bottom: 12px;">
                <a-button @click="handleDel( index )" icon="close"></a-button>
              </a-col>

              <a-col :md="0" :xs="24" style="margin-bottom: 12px;text-align: right;">
                <a-button @click="handleDel( index )" icon="close"></a-button>
              </a-col>

            </a-row>

          </a-form>
      </a-row>
      <a-row>
        <a @click="handleAdd">+ 添加条件</a>
      </a-row>
</div>
</template>

<script>
  import DynamicElement from './DynamicElement'

  export default {
    name: 'DynamicFilterQuery',
    mixins: [],
    components: { DynamicElement },
    props: {
      queryParamsModel: {
        type: Array,
        default: ()=>[]
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

    },
    data() {
      return {
      }
    },
    methods: {
      findItem(field) {
        return this.fieldList.find((el)=>el.value==field);
      },
      handleAdd() {
        this.queryParamsModel.push({ rule: 'eq' })
      },
      handleDel(index) {
        this.queryParamsModel.splice(index, 1)
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
    }
  }
</script>

<style lang="less" scoped>


  @media screen and (max-width: 576px) {
    .j-super-query-box {
      max-width: 292px;
      min-width: 242px;
    }
  }

  @media screen and (min-width: 576px) {
    .j-super-query-box {
      width: 560px;
    }
  }

</style>