export const MoveSortMixin = {
  props: [],
  data(){
    return {
    }
  },
  methods:{
   mouseDown(e) {
     //e.preventDefault();
     console.log("drag-start", e, e.target);
     this.dragging = this.bubble(e.target);
     this.dragList = this.dragging.parentNode;

     this.dragging.classList.add("dragging")
     this.dragList.classList.add("dynamic-field-list-sorting")
     this.dragList.childNodes.forEach(function(el, index) {
       el.style = "position:relative;top: 0px";
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

     var offsetY = this.offsetEvent(e, this.dragList);
     var targetIndex = Math.round(offsetY / clientHeight);
     this.dragIndex = targetIndex;
     this.changePosition(targetIndex, offsetY, e);

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

     console.log("drag-end", e, this.dragging, this.dragIndex);
     this.dragging.style.cssText = "opacity:0;z-index:0";
     this.dragging.classList.remove("dragging")
     this.dragList.classList.remove("dynamic-field-list-sorting")
     this.dragList.childNodes.forEach(function(el, index) {
       el.style.cssText = 'position:relative;top:0px';
     })

     var dragTarget = this.dragging.parentNode.childNodes[this.dragIndex];
     if (this.dragging === dragTarget) {
       this.dragging = null;
       return ;
     }
     
     if (this.dragging.index < dragTarget.index) {
       this.dragging.parentNode.insertBefore(this.dragging, dragTarget.nextSibling)
     } else {
       this.dragging.parentNode.insertBefore(this.dragging, dragTarget)
     }

     this.moveSortCallback(this.dragging)

     this.dragging = null;
   },


   changePosition(targetIndex, offsetY, e) {
     //var targetIndex = target.index;
     var dragging = this.dragging;
     var clientHeight = this.dragging.clientHeight;

     //调整顺序
     dragging.parentNode.childNodes.forEach(function(el, index) {
       if(el == dragging) {
         el.style = "position:relative;top: " + (offsetY-(dragging.index*clientHeight)-clientHeight/2) + "px";
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