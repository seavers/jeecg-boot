<template>
  <div class="dynamic-field-list">
    <a-list :data-source="settingColumns">
      <a-list-item slot="renderItem" slot-scope="item, index" :dataIndex="item.dataIndex">
        <a-icon class="dragbar" type="menu" @mousedown.left="mouseDown" />
        <span class="title">{{ title(item) }}</span>
        <a-switch size="small" :checked="item.listShow" @change="item.listShow=$event" />
      </a-list-item>
      <p><a-button icon="plus">新增字段</a-button></p>
    </a-list>
  </div>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import { MoveSortMixin } from '@/mixins/MoveSortMixin'

  export default {
    name: "DynamicFieldList",
    mixins: [MoveSortMixin],
    props: {
      columns: {
        type: Array,
        default: []
      },
      settingColumns: {
        type: Array,
        default: []
      }
    },
    data () {
      return {
      }
    },
    methods: {
      title(item) {
        var columns = this.columns;
        for(var i = 0; i < columns.length; i++) {
          if(columns[i].dataIndex == item.dataIndex) {
            return columns[i].title;
          }
        }
        return '';
      },
      moveSortIndex(dragIndex, targetIndex) {
        this.arraySwap(this.settingColumns, dragIndex, targetIndex);

        this.$emit("change", this.settingColumns);
      }
    }
  }
</script>

<style scoped>
  .dynamic-field-list .ant-list-item {
    width: 200px;
    border-bottom: none;
    padding: 0;
    display: flex;
    justify-content: space-between;
    padding: 4px 4px;
  }
  .dynamic-field-list .dragging-sorting .ant-list-item {
    transition: top 0.36s;
  }
  .dynamic-field-list .dragging-sorting .ant-list-item.dragging {
    transition: none;
    z-index: 1;
  }
  .dynamic-field-list .ant-list-item:hover {
    background: #eee;
  }
  .dynamic-field-list .dynamic-field-list-sorting .ant-list-item:hover {
    background: none;
  }
  .dynamic-field-list .ant-list-item .dragbar {
    font-size: 16px;
    padding: 4px;
    cursor: pointer;
  }
  .dynamic-field-list .ant-list-item .title {
    margin-left: 4px;
    flex-grow: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .dynamic-field-list .ant-list-item .ant-switch {
    transition: none;
    -webkit-transition: none;
  }
</style>
