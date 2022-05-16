 export const DragSortMixin = {
   props: [],
   data(){
     return {
     }
   },
   methods:{
    dragStart(e) {
      //e.preventDefault();
      console.log("drag-start", e, e.target);
      this.dragging = e.target;
      this.dragList = e.target.parentNode;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target.innerHTML);

      this.dragList.classList.add("dynamic-field-list-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        el.style = "position:relative;top: 0px";
        el.index = index;
      })
      
      setTimeout(function() {
        e.target.style.cssText = "opacity:0;z-index:1";
      }, 10);
    },
    dragEnter(e) {
      if (this.dragging == null) {
        return ;
      }
      //console.log("drag-enter", e, this.dragging.index);
      var clientHeight = this.dragging.clientHeight;

      var offsetY = e.clientY - this.dragList.getBoundingClientRect().top;
      var targetIndex = Math.round(offsetY / clientHeight);
      if(this.dragIndex != targetIndex) {
        this.changePosition(targetIndex);
        this.dragIndex = targetIndex;
      }

      //需要阻止冒泡，这样有drop事件，表示拖拽成功
      e.preventDefault();
    },
    dragOver(e) {
      if(this.dragging != null) {
        e.preventDefault();
      }
    },
    dragLeave(e) {
      //console.log("drag-leave", this.dragging.index, e.currentTarget.index );
    },
    dragEnd(e) {
      console.log("drag-end", this.dragging, this.dragIndex);
      this.dragging.style.cssText = "opacity:0;z-index:0";
      this.dragList.classList.remove("dynamic-field-list-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        el.style.cssText = 'position:relative;top:0px';
      })

      var dragTarget = this.dragging.parentNode.childNodes[this.dragIndex];
      if (this.dragging === dragTarget) {
        return ;
      }
      
      if (this.dragging.index < dragTarget.index) {
        this.dragging.parentNode.insertBefore(this.dragging, dragTarget.nextSibling)
      } else {
        this.dragging.parentNode.insertBefore(this.dragging, dragTarget)
      }

      this.dragging = null;
    },


    changePosition(targetIndex) {
      //var targetIndex = target.index;
      var dragging = this.dragging;
      var clientHeight = this.dragging.clientHeight;

      //调整顺序
      dragging.parentNode.childNodes.forEach(function(el, index) {
        if(el == dragging) {
          return;
        }

        if(dragging.index == targetIndex) {
          el.style = "position:relative;top: 0px";
        } else if(index < targetIndex && index < dragging.index) {
          el.style = "position:relative;top: 0px";
        } else if(index > targetIndex && index > dragging.index) {
          el.style = "position:relative;top: 0px";
        } else if(dragging.index < targetIndex) {
          el.style = "position:relative;top: -" + (clientHeight) + "px";
        } else {
          el.style = "position:relative;top: " + (clientHeight) + "px";
        }
      });
    },
  },
  mounted() {
    document.addEventListener("dragover", this.dragEnter);
  },
  beforeDestroy() {
    document.removeEventListener("dragover", this.dragEnter);
  }
 }