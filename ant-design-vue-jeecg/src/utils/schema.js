import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'


export function handleGetSchema(t, e) {
  return e && e.properties && function() {
      var n = function(e, t) {
          var n = t.view || t.type || "string";
          n = "inputNumber" === n ? "number" : n;
          var a = {
              type: n,
              value: t.key,
              text: t.title,
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
              s.order > l.order && (a[o] = l,
              a[c] = s)
          }
      return a;
  }()
}

export function _createForOfIteratorHelper(e, t) {
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
}


export function handleColumnHrefAndDict(e,t,n) {
  var a = e.$createElement
    , r = t.customRender
    , i = t.hrefSlotName
    , o = t.fieldType;
  if ("Date" == o)
      t.customRender = function(e) {
          return e ? e.length > 10 ? e.substring(0, 10) : e : ""
      }
      ;
  else if (!i && t.scopedSlots && t.scopedSlots.customRender && n.hasOwnProperty(t.scopedSlots.customRender) && (i = t.scopedSlots.customRender),
  r || i) {
      var c = r
        , s = "_replace_text_";
      t.customRender = function(r, o) {
          var l = r;
          if (c)
              if (c.startsWith(s)) {
                  var u = c.replace(s, "");
                  l = o[u]
              } else
                  l = filterMultiDictText(e.dictOptions[c], r);
          if (t.showLength && l && l.length > t.showLength && (l = l.substr(0, t.showLength) + "..."),
          i) {
              var d = n[i];
              if (d)
                  return a("a", {
                      on: {
                          click: function() {
                              return handleClickFieldHref(d, o)
                          }
                      }
                  }, [l])
          }
          return l
      }
  }
}

export function handleClickFieldHref(field, record) {
  var href = field.href
    , urlPattern = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/
    , compPattern = /\.vue(\?.*)?$/
    , jsPattern = /{{([^}]+)}}/g;
  "string" === typeof href && (href = href.trim().replace(/\${([^}]+)?}/g, (function(e, t) {
      return record[t]
  }
  )),
  jsPattern.test(href) && (href = href.replace(jsPattern, (function(text, s0) {
      try {
          return eval(s0)
      } catch (e) {
          return text
      }
  }
  ))),
  urlPattern.test(href) ? window.open(href, "_blank") : compPattern.test(href) ? this.openHrefCompModal(href) : this.$router.push(href))
}


