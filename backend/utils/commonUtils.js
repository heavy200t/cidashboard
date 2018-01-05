'use strict';
exports.sendRes = function(res, content) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Content-Type':'text/json',
    'Encodeing':'utf8'
  });
  res.send(content);
};

exports.timeCondition = function(field, s, e){
  /*
Date query scope is [s, e).
if s & e is not defined, it will query today's result.
if only s or e is defined, it will query one day's result([s, s+1) or [e-1, e) )
 */
  let condition = {};
  condition[field] = {};
  // let condition = {field:{}};

  let start = new Date();
  start = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  if ( s !== undefined) {
    start = new Date(Date.parse(s.replace(/-/g, "/")));
  }

  let end = new Date(start);
  end.setDate(end.getDate() + 1);

  if ( e !== undefined) {
    end = new Date(Date.parse(e.replace(/-/g, "/")));
    end.setDate(end.getDate() + 1);
    if (s === undefined) {
      start = new Date(end);
      start.setDate(start.getDate() - 1);
    }

  }

  condition[field].$gte = start;
  condition[field].$lt = end;
  return condition;
};

exports.stringEnrich = function() {
  String.prototype.replaceAll = function (exp, newStr) {
    return this.replace(new RegExp(exp, "gm"), newStr);
  };

  String.prototype.format = function(args) {
    let result = this;
    if (arguments.length < 1) {
      return result;
    }

    let data = arguments; // 如果模板参数是数组
    if (arguments.length === 1 && typeof (args) === "object") {
      // 如果模板参数是对象
      data = args;
    }
    for ( let key in data) {
      if (data.hasOwnProperty(key)){
        let value = data[key];
        if (undefined !== value) {
          result = result.replaceAll("\\{" + key + "\\}", value);
        }
      }
    }
    return result;
  }
};
