<template>
<div class="j-sort-query-box">
      <a-row>
          <a-form layout="inline">

            <a-row type="flex" drag-target="true" style="margin-bottom:12px" :gutter="16" v-for="(item, index) in sortParamsModel" :key="index">
              <a-icon class="dragbar" type="menu" @mousedown.left="mouseDown" />

              <a-col class="sort-field">
                <a-tree-select
                  v-model="item.field"
                  :treeData="fieldList"
                  :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
                  placeholder="选择查询字段"
                  allowClear
                  treeDefaultExpandAll
                  :getPopupContainer="node=>node.parentNode"
                  style="width: 100%"
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
      handleAdd() {
        this.sortParamsModel.push({ order: 'asc' })
      },
      handleDel(index) {
        this.sortParamsModel.splice(index, 1)
      },
      moveSortIndex(dragIndex, targetIndex) {
        this.arraySwap(this.sortParamsModel, dragIndex, targetIndex);
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

  .j-sort-query-box .dragging-sorting .ant-row-flex {
    transition: top 0.36s;
  }
  .j-sort-query-box .dragging-sorting .ant-row-flex.dragging {
    transition: none;
    z-index: 1;
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

</style>