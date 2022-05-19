<template>
  <a-popover title="" :visible="visible" @visibleChange="(v)=>visible=v" placement="bottomLeft" trigger="hover" overlayClassName="dynamic-popover-overlay dynamic-popover-overlay-view">
    <template #content>
      <div class="dynamic-view-list">
        <a-list :dataSource="dataSource" :loading="dataSource == null" :bordered="false" :split="false">
          <a-list-item slot="renderItem" slot-scope="item, index" @click="handleItemSelected(item, $event)" :class="currentRow==item?'active':''">
            <a-icon class="icon" type="menu" @mousedown="mouseDown"></a-icon>
            <template v-if="item.status != 'edit'">
              <span class="title">{{ item.title }}</span>
              <a-icon class="icon more" type="ellipsis"></a-icon>
            </template>
            <template v-if="item.status == 'edit'">
              <a-input v-model="item.title" @keyup.enter="createView(item)" @blur="createView(item)" :autoFocus="true"></a-input>
              <a-icon class="icon more" type="check" @click="createView(item)"></a-icon>
            </template>
          </a-list-item>
        </a-list>
        <a icon="plus" @click="addNewLine" style="padding:8px">+ 新建视图</a>
      </div>
    </template>
    <a-button type="default" icon="double-right" :bordered="false" style="min-width: 118px">{{ currentRow.title || "默认视图"}}</a-button>
  </a-popover>
</template>

<script>
  import { MoveSortMixin } from '@/mixins/MoveSortMixin'

  export default {
    name: 'DynamicViewList',
    mixins: [MoveSortMixin],
    components: { },
    props: {
      viewId: {
        type: Number
      }
    },
    data() {
      return {
        dynamicId: -1,
        currentViewId: -1,
        dataSource: [],
        currentRow: null,
        visible: false
      }
    },
    created() {
      this.dynamicId = this.$route.params.code;
      this.dataSource = this.$ls.get("dynamic:view-list:" + this.dynamicId) || this.defaultDataSource()
      if(this.currentViewId != -1) {
        this.currentRow = this.dataSource.find((el) => el.id = this.currentViewId);
      }
      if(this.currentRow == null) {
        this.currentRow = this.dataSource[0];
      }
      this.currentViewId = this.currentRow.id;
      this.$emit('update:viewId', this.currentViewId);
    },
    watch: {
      dataSource: {
        deep: true,
        handler: function(value) {
          this.$ls.set("dynamic:view-list:" + this.dynamicId, value)
        }
      }
    },
    methods: {
      defaultDataSource() {
        return [
          {
            id: new Date().getTime(),
            title: "默认视图"
          }
        ]
      },
      addNewLine() {
        this.dataSource.push({
          id: new Date().getTime(),
          title: "表格视图"+(this.dataSource.length),
          status: "edit"
        })
      },
      createView(item) {
        item.status = ""
      },
      moveSortIndex(fromIndex, toIndex) {
        this.lastMoveSortTimestamp = new Date().getTime();
        this.arraySwap(this.dataSource, fromIndex, toIndex)
      },
      handleItemSelected(item, event) {
        if(new Date().getTime() - this.lastMoveSortTimestamp < 150) {     //刚拖拽完，不算点击
          return ;
        }

        this.currentRow = item;
        this.currentViewId = item.id;
        this.visible = false;
        this.$emit('update:viewId', this.currentViewId);
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
  cursor: pointer;
}
.dynamic-view-list li.active .title {
  color: #3370ff;
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