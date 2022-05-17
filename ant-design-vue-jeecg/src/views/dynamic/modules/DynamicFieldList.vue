<template>
  <div class="dynamic-field-list">
    <a-list :data-source="columns">
      <a-list-item slot="renderItem" slot-scope="item, index" >
        <a-icon class="dragbar" type="menu" @mousedown="mouseDown" />
        <span class="title">{{ item.title }}</span>
        <a-switch size="small" :checked="settingColumns.indexOf(item.dataIndex)>-1" @change="onChangeFieldShow" :v-data-index="item.dataIndex"/>
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
    data () {
      return {
        dragging: null,
        nodes: [],
      }
    },
    props: {
      columns: [],
      settingColumns: []
    },
    methods: {
      onChangeFieldShow(checked, ev) {
        console.log(`a-switch to ${checked} ${ev.target}`)
        var index = ev.target.getAttribute('v-data-index')
        if (checked) {
          this.settingColumns.indexOf(index) == -1 && this.settingColumns.push(index);
        } else {
          this.settingColumns.indexOf(index) > -1 && this.settingColumns.splice(this.settingColumns.indexOf(index), 1);
        }

        this.$emit("change", this.settingColumns)
      },


      moveSortCall(dragIndex, targetIndex) {
        var drag = this.settingColumns[dragIndex];
        this.settingColumns.splice(dragIndex, 1)
        this.settingColumns.splice(targetIndex, 0, drag);
        console.log(this.settingColumns)
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
