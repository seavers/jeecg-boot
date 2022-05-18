export const MoveSortMixin = {
  props: [],
  data(){
    return {
    }
  },
  methods:{
    mouseDown(e) {
      //e.preventDefault();
      console.debug("drag-start", e, e.target);
      this.dragging = this.bubble(e.target);
      this.dragList = this.dragging.parentNode;
      
      this.dragging.classList.add("dragging")
      this.dragList.classList.add("dynamic-field-list-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        el.style = "position:relative;top: 0px";
        el.dragTop = el.offsetTop;
        el.index = index;
      })
      
      var dragging = this.dragging;
      setTimeout(function() {
        //dragging.style.cssText = "opacity:0;z-index:1";
      }, 10);
      
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
    },
    mouseMove(e) {
      if (this.dragging == null) {
        document.removeEventListener('mousemove', this.mouseMove);
        return ;
      }
      //console.log("mouse-move", e, this.dragging.index);
      var clientHeight = this.dragging.clientHeight;
      var maxIndex = this.dragList.clientHeight/clientHeight;
      
      var offsetY = this.offsetEvent(e, this.dragList);
      this.changePosition(offsetY, e);
      
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
    mouseUp(e) {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
      if(this.dragging == null) {
        return ;
      }
      
      console.debug("drag-end", e, this.dragging, this.dragTargetIndex);
      this.dragging.style.cssText = "opacity:0;z-index:0";
      this.dragging.classList.remove("dragging")
      this.dragList.classList.remove("dynamic-field-list-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        el.style.cssText = 'position:relative;top:0px';
      })
      
      var dragTarget = this.dragging.parentNode.childNodes[this.dragTargetIndex];
      if (this.dragging === dragTarget) {
        this.dragging = null;
        return ;
      }
      
      
      //计算dragTargetIndex
      var dragging = this.dragging;
      var clientHeight = dragging.clientHeight;
      var offsetY = this.offsetEvent(e, this.dragList);
      
      var draggingIndex = -1;
      var targetIndex = -1;
      var children = this.dragging.parentNode.childNodes;
      for(var i = 0; i < children.length; i++) {
        var el = children[i];
        if(el.dragTop < dragging.dragTop) {
          var base = el.dragTop + clientHeight/2;
          if (offsetY < base) {
            targetIndex = i;
            break;
          }
        } else if(el.dragTop > dragging.dragTop) {
          var base = el.dragTop - clientHeight/2;
          if (offsetY > base) {
            targetIndex = i;
          }
        }
      }
      
      for(var i = 0; i < children.length; i++) {
        var el = children[i];
        if(el == dragging) {
          draggingIndex = i;
        }
      }
      
      if (draggingIndex != -1 && targetIndex != -1) {
        this.moveSortIndex(draggingIndex, targetIndex)
      } else {
        console.error("drag index error", draggingIndex, targetIndex);
      }
      
      this.dragging = null;
    },
    
    
    changePosition(offsetY, e) {
      //var targetIndex = target.index;
      var dragging = this.dragging;
      var clientHeight = this.dragging.clientHeight;
      var maxOffset = dragging.parentNode.clientHeight;
      
      //调整顺序
      dragging.parentNode.childNodes.forEach(function(el, index) {
        if(el == dragging) {
          if (offsetY < clientHeight/2) {
            offsetY = clientHeight/2;
          } else if(offsetY > maxOffset - clientHeight/2) {
            offsetY = maxOffset - clientHeight/2;
          }
          var top = (offsetY-el.dragTop-clientHeight/2);
          el.style = "position:relative;top: " + top + "px";
          return;
        }
        
        if(el.dragTop < dragging.dragTop) {
          var base = el.dragTop + clientHeight/2;
          if (offsetY < base) {
            el.style = "position:relative;top: " + (clientHeight) + "px";
          } else {
            el.style = "position:relative;top: 0px";
          }
        } else if(el.dragTop > dragging.dragTop) {
          var base = el.dragTop - clientHeight/2;
          if (offsetY > base) {
            el.style = "position:relative;top: " + (-clientHeight) + "px";
          } else {
            el.style = "position:relative;top: 0px";
          }
        } else {
          el.style = "position:relative;top: 0px";
        }
      });
    },
    bubble(el) {
      while(el != null) {
        if(el.tagName == 'LI' || el.classList.contains("ant-row") || el.classList.contains("ant-row-flex")) {
          return el;
        }
        el = el.parentNode
      }
    },
    offset(el, base) {
      return el.getBoundingClientRect().top - base.getBoundingClientRect().top;
    },
    offsetEvent(e, base) {
      return e.clientY - base.getBoundingClientRect().top;
    }
  },
  mounted() {
    //document.addEventListener("mousemove", this.mouseMove);
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", this.mouseMove);
  }
}