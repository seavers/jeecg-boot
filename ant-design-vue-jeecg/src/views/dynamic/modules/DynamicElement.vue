<template>
  <span>
  <!-- 下拉搜索 -->
    <j-search-select-tag v-if="item.type==='sel_search'" v-model="itemValue" :dict="getDictInfo(item)" placeholder="请选择"/>
    <!-- 下拉多选 -->
    <template v-else-if="item.type==='list_multi'">
      <j-multi-select-tag v-if="item.options" v-model="itemValue" :options="item.options" placeholder="请选择"/>
      <j-multi-select-tag v-else v-model="itemValue" :dictCode="getDictInfo(item)" placeholder="请选择"/>
    </template>

    <template v-else-if="item.dictCode">
      <template v-if="item.type === 'table-dict'">
        <j-popup
          v-model="itemValue"
          :code="item.dictTable"
          :field="item.dictCode"
          :orgFields="item.dictCode"
          :destFields="item.dictCode"
          :multi="true"
        ></j-popup>
      </template>
      <template v-else>
        <j-multi-select-tag v-show="allowMultiple(item)" v-model="itemValue" :dictCode="item.dictCode" placeholder="请选择"/>
        <j-dict-select-tag v-show="!allowMultiple(item)" v-model="itemValue" :dictCode="item.dictCode" placeholder="请选择"/>
      </template>
    </template>
    <j-popup
      v-else-if="item.type === 'popup'"
      :value="itemValue"
      v-bind="item.popup"
      group-id="superQuery"
      @input="(e,v)=>handleChangeJPopup(item,e,v)"
      :multi="true"/>
    <j-select-multi-user
      v-else-if="item.type === 'select-user' || item.type === 'sel_user'"
      v-model="itemValue"
      :buttons="false"
      :multiple="false"
      placeholder="请选择用户"
      :returnKeys="['id', item.customReturnField || 'username']"
    />
    <j-select-depart
      v-else-if="item.type === 'select-depart' || item.type === 'sel_depart'"
      v-model="itemValue"
      :multi="false"
      placeholder="请选择部门"
      :customReturnField="item.customReturnField || 'id'"
    />
    <a-select
      v-else-if="item.options instanceof Array"
      v-model="itemValue"
      :options="item.options"
      allowClear
      placeholder="请选择"
      :mode="allowMultiple(item)?'multiple':''"
    />
    <j-area-linkage v-model="itemValue" v-else-if="item.type==='area-linkage' || item.type==='pca'" style="width: 100%"/>
    <j-date v-else-if=" item.type=='date' " v-model="itemValue" placeholder="请选择日期" style="width: 100%"></j-date>
    <j-date v-else-if=" item.type=='datetime' " v-model="itemValue" placeholder="请选择时间" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"></j-date>
    <a-time-picker v-else-if="item.type==='time'" :value="itemValue ? moment(itemValue,'HH:mm:ss') : null" format="HH:mm:ss" style="width: 100%" @change="(time,value)=>itemValue=value"/>
    <a-input-number v-else-if=" item.type=='int'||item.type=='number' " style="width: 100%" placeholder="请输入数值" v-model="itemValue"/>
    <a-select v-else-if="item.type=='switch'" placeholder="请选择" v-model="itemValue">
      <a-select-option value="Y">是</a-select-option>
      <a-select-option value="N">否</a-select-option>
    </a-select>
    <a-input v-else v-model="itemValue" placeholder="请输入值"/>
  </span>
</template>

<script>
  import moment from 'moment'

  export default {
    name: 'DynamicFilterQuery',
    components: {  },
    props: {
      item: {
        type: Object
      },
      rule: {
        type: String
      },
      value: {
        type: String
      }
    },
    data() {
      return {
        moment,
      }
    },
    computed: {
      itemValue: {
        get: function() {
          return this.value;
        },
        set: function(val) {
          this.$emit('update:value', val)
        }
      }
    },
    methods: {
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
      /** 判断是否允许多选 */
      allowMultiple(item) {
        return this.rule === 'in'
      },
      handleChangeJPopup(item, e, values) {
        itemValue = values[item.popup['destFields']]
      },
    }
  }
</script>