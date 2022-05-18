<template>
  <div class="dynamic-field-list">
    <a-list :data-source="settingColumnsCopy">
      <a-list-item slot="renderItem" slot-scope="item, index" :dataIndex="item.dataIndex">
        <a-icon class="dragbar" type="menu" @mousedown="mouseDown" />
        <span class="title">{{ title(item) }}</span>
        <a-switch size="small" default-checked @change="onChangeFieldShow(item, $event)" />
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
        settingColumnsCopy: []
      }
    },
    created() {
      this.settingColumnsCopy = [].concat(this.settingColumns)
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
      onChangeFieldShow(item, checked) {
        //console.log(`a-switch to ${checked} ${ev.target}`)
        item.listShow = checked;
        this.moveSortCallback()
      },
      moveSortCallback() {
        var parentNode = this.$el.querySelector('.ant-list-items');

        var dataIndexes = [];
        parentNode.childNodes.forEach(function(el) {
          dataIndexes.push(el.getAttribute("dataIndex"))
        })
        this.settingColumns.sort(function(a, b) {
          return dataIndexes.indexOf(a.dataIndex) - dataIndexes.indexOf(b.dataIndex);
        })

        console.log("field-list", dataIndexes)
        this.$emit("change", dataIndexes);
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
  .dynamic-field-list .dynamic-field-list-sorting .ant-list-item {
    transition: top 0.36s;
  }
  .dynamic-field-list .dynamic-field-list-sorting .ant-list-item.dragging {
    transition: none;
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
