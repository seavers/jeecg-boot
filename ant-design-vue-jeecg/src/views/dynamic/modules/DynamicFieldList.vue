<template>
  <div class="dynamic-field-list">
    <a-list :data-source="columns">
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-icon class="dragbar" type="menu" />
        <span class="title">{{ item.title }}</span>
        <a-switch size="small" :checked="settingColumns.indexOf(item.dataIndex)>-1" @change="onChangeFieldShow" :v-data-index="item.dataIndex"/>
      </a-list-item>
      <p><a-button icon="plus">新增字段</a-button></p>
    </a-list>
  </div>
</template>

<script>
  import { httpAction } from '@/api/manage'

  export default {
    name: "DynamicFieldList",
    data () {
      return {
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
    }
  }
</script>


<style scoped>
  .dynamic-field-list .ant-list-item {
    width: 200px;
    border-bottom: none;
    padding: 4px 4px;
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
  .dynamic-field-list .ant-list-item:hover {
    background: #eee;
  }
</style>
