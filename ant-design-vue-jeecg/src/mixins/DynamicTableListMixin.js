import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'

export const DynamicTableListMixin = {
  props: [],
  data(){
    return {
    }
  },
  methods: {
    handleGetSchema(t, e) {
      return e && e.properties && function() {
        var n = function(e, t) {
          var n = t.view || t.type || "string";
          n = "inputNumber" === n ? "number" : n;
          var a = {
            type: n,
            value: t.key,
            text: t.title,
            label: t.title,
            dictCode: t.dictCode,
            dictTable: t.dictTable,
            dictText: t.dictText,
            options: t.enum || t.options,
            order: t.order
          };
          "popup" === n && (a["popup"] = {
            code: t.popupCode || t.code,
            field: t.orgFields.split(",")[0],
            orgFields: t.orgFields.split(",")[0],
            destFields: t.destFields.split(",")[0]
          }),
          e.push(a)
        }
        , a = []
        , r = function(t) {
          if (!e.properties.hasOwnProperty(t))
          return "continue";
          var r = e.properties[t];
          if ("tab" === r.view && 0 == r.relationType) {
            var i = {
              type: "sub-table",
              value: r.key,
              text: r.describe,
              children: []
            };
            if (r.columns) {
              var o, c = _createForOfIteratorHelper(r.columns);
              try {
                for (c.s(); !(o = c.n()).done; ) {
                  var s = o.value;
                  n(i.children, s)
                }
              } catch (u) {
                c.e(u)
              } finally {
                c.f()
              }
            }
            a.push(i)
          } else if ("tab" === r.view && 1 == r.relationType) {
            var l = {
              type: "sub-table",
              value: r.key,
              text: r.describe,
              children: []
            };
            Object.keys(r.properties).map((function(e) {
              r.properties[e]["key"] = e,
              n(l.children, r.properties[e])
            }
            )),
            a.push(l)
          } else
          r.key = t,
          n(a, r)
        };
        for (var i in e.properties)
        r(i);
        for (var o = 0; o < a.length; o++)
        for (var c = o + 1; c < a.length; c++) {
          var s = a[o]
          , l = a[c];
          s.order > l.order && (a[o] = l, a[c] = s)
        }
        return a;
      }()
      
    },
    
    _createForOfIteratorHelper(e, t) {
      var n;
      if ("undefined" === typeof Symbol || null == e[Symbol.iterator]) {
        if (Array.isArray(e) || (n = _unsupportedIterableToArray(e)) || t && e && "number" === typeof e.length) {
          n && (e = n);
          var a = 0
          , r = function() {};
          return {
            s: r,
            n: function() {
              return a >= e.length ? {
                done: !0
              } : {
                done: !1,
                value: e[a++]
              }
            },
            e: function(e) {
              throw e
            },
            f: r
          }
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
      }
      var i, o = !0, c = !1;
      return {
        s: function() {
          n = e[Symbol.iterator]()
        },
        n: function() {
          var e = n.next();
          return o = e.done,
          e
        },
        e: function(e) {
          c = !0,
          i = e
        },
        f: function() {
          try {
            o || null == n.return || n.return()
          } finally {
            if (c)
            throw i
          }
        }
      }
    },
    
    handleColumnShowLength: function(column) {
      var t = this.$createElement;
      if(column.showLength && "function" != typeof column.customRender) {
        column.customRender = function(e) {
          return e && e.length > column.showLength ? t("span", {
            attrs: {
              title: e
            }
          }, [e.substr(0, n), "..."]) : e
        }
      }
    },
    
    handleColumnDictOptions(dictOptions) {
      Object.values(dictOptions).forEach(options => {
        options.forEach(option => {
          var hue = Math.floor(Math.random()* 256);
          option.backgroundColor = "hsl("+hue+"deg 100% 90%)";
        });
      });
    },
    handleColumnHrefAndDict(column,fieldHrefSlots) {
      var vm = this;
      var customRender = column.customRender
      var hrefSlotName = column.hrefSlotName
      if ("Date" == column.fieldType || column.scopedSlots && column.scopedSlots.customRender == 'dateSlot') {
        column.customRender = function(e) {
          return e ? e.length > 10 ? e.substring(0, 10) : e : ""
        }
      }
      if (!hrefSlotName && column.scopedSlots && column.scopedSlots.customRender && fieldHrefSlots.hasOwnProperty(column.scopedSlots.customRender)) {
        hrefSlotName = column.scopedSlots.customRender
      }
      if(customRender || hrefSlotName) {
        var custom = customRender
        column.customRender = function(value, context) {
          if (custom) {
            if (custom.startsWith("_replace_text_")) {
              var u = custom.replace("_replace_text_", "");
              value = context[u]
            } else {
              var values = vm.filterMultiDict(vm.dictOptions[custom], value);
              if(values.length == 0) {
                return "";
              } else if(values.length == 1) {
                var option = values[0];
                return vm.$createElement("span", {
                  class: {
                    "dynamic-option": true
                  },
                  style: {
                    backgroundColor: option.backgroundColor,
                  }
                }, [option.text])
              } else {
                return vm.$createElement("span", {}, values.map(function(option) {
                  return vm.$createElement("span", {
                    class: {
                      "dynamic-option": true
                    },
                    style: {
                      backgroundColor: option.backgroundColor,
                    }
                  }, [option.text])
                }));
              }
            }
          }
          if (column.showLength && value && value.length > column.showLength) {
            value = value.substr(0, column.showLength) + "..."
          }
          if(hrefSlotName) {
            var href = fieldHrefSlots[hrefSlotName];
            if (href) {
              return vm.$createElement("a", {
                on: {
                  click: function() {
                    return vm.handleClickFieldHref(href, context)
                  }
                }
              }, [value])
            }
          }
          return value
        }
      }
    },
    
    handleClickFieldHref(field, record) {
      var href = field.href
      , urlPattern = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/
      , compPattern = /\.vue(\?.*)?$/
      , jsPattern = /{{([^}]+)}}/g;
      if("string" === typeof href) {
        href = href.trim().replace(/\${([^}]+)?}/g, function(e, t) {
          return record[t]
        });
      }
      if(jsPattern.test(href)) {
        href = href.replace(jsPattern, function(text, s0) {
          try {
            return eval(s0)
          } catch (e) {
            return text
          }
        });
      }
      if(urlPattern.test(href)) {
        window.open(href, "_blank")
      } else if(compPattern.test(href)) {
        this.openHrefCompModal(href)
      } else {
        this.$router.push(href)
      }
    },
    
    openHrefCompModal(e) {
      var t = e.indexOf("?")
      , n = e;
      if (-1 !== t) {
        n = e.substring(0, t);
        var a = e.substring(t + 1, e.length)
        , r = a.split("&")
        , i = {};
        r.forEach((function(e) {
          var t = e.split("=");
          i[t[0]] = t[1]
        }
        )),
        this.hrefComponent.params = i
      } else
      this.hrefComponent.params = {};
      this.hrefComponent.model.visible = !0,
      this.hrefComponent.model.title = "操作",
      this.hrefComponent.is = function() {
        return __webpack_require__("9dac")("./" + (n.startsWith("/") ? n.slice(1) : n))
      }
    },

    filterMultiDict(dictOptions, text) {
      if(dictOptions==null) {
        return []
      }

      let re = "";
      text = text.toString()
      let arr = text.split(",")
      return dictOptions.filter(function (option) {
        for(let i=0;i<arr.length;i++){
          if (arr[i] === option.value) {
            return true;
          }
        }
      });
    }
  }
}


