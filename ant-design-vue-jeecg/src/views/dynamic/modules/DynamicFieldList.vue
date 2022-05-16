<template>
  <div class="dynamic-field-list">
    <a-list :data-source="columns">
      <a-list-item slot="renderItem" slot-scope="item, index" draggable="true" @dragstart.native="dragStart($event, item)" @dragenter="dragEnter($event)" @dragover="dragOver($event)" @dragleave="dragLeave($event)" @dragend.native="dragEnd($event)">
        <div class="dynamic-field-item-wrap">
          <a-icon class="dragbar" type="menu" />
          <span class="title">{{ item.title }}</span>
          <a-switch size="small" :checked="settingColumns.indexOf(item.dataIndex)>-1" @change="onChangeFieldShow" :v-data-index="item.dataIndex"/>
        </div>
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


      dragStart(e) {
        console.log("drag-start", e, e.target);
        this.dragging = e.target;

        //e.preventDefault();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);

        document.querySelector('.dynamic-field-list').classList.add("dynamic-field-list-sorting")
        e.target.parentNode.childNodes.forEach(function(el, index) {
          el.style = 'position:relative';
          el.firstChild.style = "position:relative;top: 0px";
          el.index = index;
        })

        setTimeout(() => {
          e.target.firstChild.style="opacity: 0;z-index:1";
        }, 10);
      },
      dragEnter(e) {
        console.log("drag-enter", this.dragging.index, e.currentTarget.index );
        if (this.dragging == null) {
          return ;
        }
        //e.preventDefault();
        //console.log(this.dragging.innerText, e.currentTarget.innerText, e.currentTarget.nextSibling.innerText);
        this.dragTarget = e.currentTarget;
        var target = e.currentTarget;
        var dragging = this.dragging;
        var clientHeight = this.dragging.clientHeight;

        //调整顺序
        dragging.parentNode.childNodes.forEach(function(el, index) {
          if(el == dragging) {
            return;
          }

          if(dragging.index == target.index) {
            el.firstChild.style = "position:relative;top: 0px";
          } else if(index < target.index && index < dragging.index) {
            el.firstChild.style = "position:relative;top: 0px";
          } else if(index > target.index && index > dragging.index) {
            el.firstChild.style = "position:relative;top: 0px";
          } else if(dragging.index < target.index) {
            el.firstChild.style = "position:relative;top: -" + (clientHeight) + "px";
          } else {
            el.firstChild.style = "position:relative;top: " + (clientHeight) + "px";
          }
        });

        e.preventDefault();
      },
      dragOver(e) {
        e.preventDefault();
      },
      dragLeave(e) {
        //console.log("drag-leave", this.dragging.index, e.currentTarget.index );
      },
      dragEnd(e) {
        console.log("drag-end", this.dragging, this.dragTarget);
        this.dragging.firstChild.style.cssText = "opacity:1;z-index:0";
        document.querySelector('.dynamic-field-list').classList.remove("dynamic-field-list-sorting")
        this.dragging.parentNode.childNodes.forEach(function(el, index) {
          el.firstChild.style.cssText = 'position:relative;top:0px';
        })

        if (this.dragging === this.dragTarget) {
          return ;
        }
        if (this.dragging.index < this.dragTarget.index) {
          this.dragging.parentNode.insertBefore(this.dragging, this.dragTarget.nextSibling)
        } else {
          this.dragging.parentNode.insertBefore(this.dragging, this.dragTarget)
        }

        this.dragging = null;
      },


//         let targetTop = e.target.getBoundingClientRect().top
//         let dragingTop = this.getBoundingClientRect().top
// //      console.log('drag move', targetTop)
//         if(this.target.nodeName==='LI'&&this.target !== this.draging) {
//           if(this.target&&this.target.animated) {
//             return
//           }
//           let targetIndex = this.target.getAttribute('index')
//           let dragingIndex = this.draging.getAttribute('index')
//           if(targetIndex > dragingIndex) {//拖拽元素往下移动
//             //target的下一个元素
//             this.target.parentNode.insertBefore(this.draging, this.target.nextSibling)
//           }else{
//             this.target.parentNode.insertBefore(this.draging, this.target)
//           }
//           this._animation(targetTop, this.target)
//           this._animation(dragingTop, this.draging) 
//         }
//      }
    }
  }
</script>


<style scoped>
.dynamic-field-list .ant-list-item {
    width: 200px;
    border-bottom: none;
    padding: 0;
  }
  .dynamic-field-list .dynamic-field-item-wrap {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 4px 4px;
  }
  .dynamic-field-list-sorting .dynamic-field-item-wrap {
    transition: top 0.36s;
  }
  .dynamic-field-list .dynamic-field-item-wrap .dragbar {
    font-size: 16px;
    padding: 4px;
    cursor: pointer;
  }
  .dynamic-field-list .dynamic-field-item-wrap .title {
    margin-left: 4px;
    flex-grow: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .dynamic-field-list .dynamic-field-item-wrap .ant-switch {
    transition: none;
    -webkit-transition: none;
  }
  .dynamic-field-list .dynamic-field-item-wrap:hover {
    background: #eee;
  }
</style>
