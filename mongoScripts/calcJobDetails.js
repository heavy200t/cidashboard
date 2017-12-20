db.system.js.remove({_id: 'calcJobDetails'});
db.system.js.insert({
  _id: 'calcJobDetails',
  value: function (job) {
    db.loadServerScripts();
    var result = [];
    var data = db.reports.aggregate([
      {$match: {"jobName": job._id.jobName, "buildId": job._id.buildId}},
      {$group: {
        _id: {category: "$category", reportUrl: "$testReportUrl"},
        total: {$sum: 1},
        pass: {$sum: {$cond: {if: "$testFailed", then:0, else: 1}}},
        fail: {$sum: {$cond: {if: "$testFailed", then:1, else: 0}}},
        unstable: {$sum: {$cond: {if: "$markedUnstable", then:1, else: 0}}}
      }}
    ]);
    while(data.hasNext()) {
      var item = data.next();
      item.category = getCategory(item._id.category);
      item.type = getType(item._id.reportUrl);
      item.combinedCategory = item.category;
      item.combinedCategory += (item.type != undefined) ? '[' + item.type + ']' : '';
      item.pass_percent = calcPercent(item.pass, item.total);
      item.fail_percent = calcPercent(item.fail, item.total);
      item.unstable_percent = calcPercent(item.unstable, item.total);
      result.push(item);
    }
    return(result);
  }
});
