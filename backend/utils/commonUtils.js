'use strict';
let request = require('request-promise');

exports.sendRes = function(res, content) {
  res.send(content);
};

exports.timeCondition_pg = function(field, s, e){
  /*
Date query scope is [s, e).
if s & e is not defined, it will query today's result.
if only s or e is defined, it will query one day's result([s, s+1) or [e-1, e) )
 */
  let condition = [];

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
  condition.push({field: field, op: '>=', value: start});
  condition.push({field: field, op: '<', value: end});
  return condition;
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

let dateEnrich = function () {
  Date.prototype.format = function(fmt) {
    let o = {
      "M+" : this.getMonth()+1,                 //月份
      "d+" : this.getDate(),                    //日
      "h+" : this.getHours(),                   //小时
      "m+" : this.getMinutes(),                 //分
      "s+" : this.getSeconds(),                 //秒
      "q+" : Math.floor((this.getMonth()+3)/3), //季度
      "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(let k in o) {
      if(new RegExp("("+ k +")").test(fmt)){
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      }
    }
    return fmt;
  }
};

let stringEnrich = function() {
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

exports.queryJenkinsSetting = function(url) {
  let req_opt = {
    uri: '{0}/api/json'.format(url),
    json: true
  };
  return new Promise((resolve, reject) => {
    request(req_opt)
      .then(res => {resolve(res)})
      .catch(err => {reject(err)});
  });
};

exports.calcPercent = function (v, t) {
  return Math.round(v * 10000 / t) / 100;
};

exports.init = function () {
  dateEnrich();
  stringEnrich();
};
