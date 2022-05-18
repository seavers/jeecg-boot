<template>
  <div class="dynamic-view-list">
    <a-list :dataSource="dataSource" :loading="dataSource == null" :bordered="false" :split="false">
      <a-list-item v-if="item.status != 'edit'" slot="renderItem" slot-scope="item, index">
        <a-icon class="icon" type="menu" @mousedown="mouseDown"></a-icon>
        <span class="title">{{ item.title }}</span>
        <a-icon class="icon more" type="ellipsis"></a-icon>
      </a-list-item>
      <a-list-item v-else-if="item.status == 'edit'" slot="renderItem" slot-scope="item, index">
        <a-icon class="icon" type="menu" @mousedown="mouseDown"></a-icon>
        <a-input v-model="item.title" @keyup.enter="createView(item)" @blur="createView(item)" autofocus="autofocus"></a-input>
        <a-icon class="icon more" type="check" @click="createView(item)"></a-icon>
      </a-list-item>
    </a-list>
    <a icon="plus" @click="addNewLine" style="padding:8px">+ 新建视图</a>
  </div>
</template>

<script>
  import moment from 'moment'
  import * as utils from '@/utils/util'
  import { MoveSortMixin } from '@/mixins/MoveSortMixin'

  export default {
    name: 'DynamicViewList',
    mixins: [MoveSortMixin],
    components: { },
    props: {
    },
    created() {
      this.loadViewList();
    },
    data() {
      return {
        // dataSource: undefined
        //保存查询条件的treeData
        dataSource: [
          {"title": "test"},
          {"title": "当前视图"},
          {"title": "项目视图"},
          {"title": "负责人视图"},
          {"title": "环境视图"},
        ],
      }
    },
    methods: {
      loadViewList() {
        var fullSaveCode = 'JSuperQuerySaved_/online/cgformList/1cdc4a8e6d8e4eeb97c0bd160671fd1e'
        // var that = this;
        // setTimeout(function() {
        //   that.dataSource = [
        //     {"title": "test"},
        //     {"title": "当前视图"},
        //     {"title": "项目视图"},
        //     {"title": "负责人视图"},
        //     {"title": "环境视图"},
        //   ]
        // }, 2000)
      },
      addNewLine() {
        this.dataSource.push({
          title: "表格视图"+(this.dataSource.length),
          status: "edit"
        })
      },
      createView(item) {
        item.status = ""
      }
    }
  }
</script>

<style scoped>
.dynamic-view-list {
  width: 200px;
}
.dynamic-view-list li {
  padding: 6px 0;
  margin: 0 4px;
}
.dynamic-view-list li:hover {
  background: #eee;
}
.dynamic-view-list li .icon {
  font-size: 16px;
  padding: 4px;
  margin-right: 6px;
}
.dynamic-view-list li .title {
  flex-grow: 1
}
.dynamic-view-list li .more:hover {
  background: #ccc;
}
</style>