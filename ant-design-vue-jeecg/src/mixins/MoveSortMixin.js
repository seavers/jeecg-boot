export const MoveSortMixin = {
  props: [],
  data(){
    return {
    }
  },
  methods:{
    mouseDown(e) {
      var that = this;
      if(e.button != 0) {
        return ;
      }

      //e.preventDefault();
      console.debug("drag-start", e);
      this.dragging = this.bubble(e.target);
      this.dragList = this.dragging.parentNode;
      
      this.dragging.classList.add("dragging")
      this.dragList.classList.add("dragging-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        that.setCssStyleTop(el, 0)
        el.dragTop = el.offsetTop;
        el.index = index;
      })
      
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
    },
    mouseMove(e) {
      var that = this;
      if (this.dragging == null) {
        document.removeEventListener('mousemove', this.mouseMove);
        return ;
      }
      
      var offsetY = this.offsetEvent(e, this.dragList);
      //var targetIndex = target.index;
      var dragging = this.dragging;
      var clientHeight = this.dragging.clientHeight + this.getCssStyleMarginBottom(this.dragging);
      var maxOffset = dragging.parentNode.clientHeight + this.getCssStyleMarginBottom(this.dragging);
      
      //调整顺序
      dragging.parentNode.childNodes.forEach(function(el, index) {
        if(el == dragging) {
          if (offsetY < clientHeight/2) {
            offsetY = clientHeight/2;
          } else if(offsetY > maxOffset - clientHeight/2) {
            offsetY = maxOffset - clientHeight/2;
          }
          var top = (offsetY-el.dragTop-clientHeight/2);
          that.setCssStyleTop(el, top)
          return;
        }
        
        if(el.dragTop < dragging.dragTop) {
          var base = el.dragTop + clientHeight;
          if (offsetY < base) {
            that.setCssStyleTop(el, clientHeight)
          } else {
            that.setCssStyleTop(el, 0)
          }
        } else if(el.dragTop > dragging.dragTop) {
          var base = el.dragTop;
          if (offsetY > base) {
            that.setCssStyleTop(el, -clientHeight)
          } else {
            that.setCssStyleTop(el, 0)
          }
        } else {
          that.setCssStyleTop(el, 0)
        }
      });
      
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
      var that = this;
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
      if(this.dragging == null) {
        return ;
      }
      
      //this.dragging.style.cssText = "opacity:0;z-index:0";
      this.dragging.classList.remove("dragging")
      this.dragList.classList.remove("dragging-sorting")
      this.dragList.childNodes.forEach(function(el, index) {
        that.setCssStyleTop(el, 0)
      })
      
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
          var base = el.dragTop + clientHeight;
          if (offsetY < base) {
            targetIndex = i;
            break;
          }
        } else if(el.dragTop > dragging.dragTop) {
          var base = el.dragTop;
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

            
      console.info("drag-end", draggingIndex, targetIndex);
      var dragTarget = this.dragging.parentNode.childNodes[targetIndex];
      if (this.dragging === dragTarget) {
        this.dragging = null;
        return ;
      }
      
      if (draggingIndex != -1 && targetIndex != -1) {
        this.moveSortIndex(draggingIndex, targetIndex)
      } else {
        console.error("drag index error", draggingIndex, targetIndex);
      }
      
      this.dragging = null;
    },

    arraySwap(array, fromIndex, toIndex) {
      var drag = array.splice(fromIndex, 1)[0];
      array.splice(toIndex, 0, drag);
    },

    setCssStyleTop(el, top) {
      el.style.setProperty('position', 'relative');
      el.style.setProperty('top', top + 'px');
      console.log("css.top", top, el)
    },
    getCssStyleMarginBottom(el) {
      var marginBottom = el.style.getPropertyValue('margin-bottom');
      if(marginBottom != null && marginBottom.indexOf('px') > -1) {
        return Number(marginBottom.slice(0, -2))
      }
      return 0;
    },
    
    bubble(el) {
      while(el != null) {
        if(el.tagName == 'LI' || el.classList.contains("ant-row") || el.classList.contains("ant-row-flex")) {
          return el;
        }
        el = el.parentNode
      }
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