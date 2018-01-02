db.system.js.remove({_id: 'calcBuilds'});
db.system.js.insert({
  _id: "calcBuilds",
  value: function (start) {
    db.loadServerScripts();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start = new Date(start);
    end = new Date(start);
    end.setDate(end.getDate() + 1 );
    let data = db.reports.aggregate([
      {$match: {"insertionTime": {$gte: start, $lt: end}}},
      {$group: {
        _id: {jobName: "$jobName", buildId: "$buildId"},
        total: {$sum: 1},
        pass: {$sum: {$cond: {if: "$testFailed", then:0, else: 1}}},
        fail: {$sum: {$cond: {if: "$testFailed", then:1, else: 0}}},
        unstable: {$sum: {$cond: {if: "$markedUnstable", then:1, else: 0}}},
        startTime: {$min: "$insertionTime"}
      }},
      {$sort: {
        "_id.jobName": 1,
        "_id.buildId": 1
      }}
    ]);
    while(data.hasNext()){
      let build = data.next();
      build.pass_percent = calcPercent(build.pass, build.total);
      build.fail_percent = calcPercent(build.fail, build.total);
      build.unstable_percent = calcPercent(build.unstable, build.total);
      build.detail = calcJobDetails(build);
      db.builds.update({"_id": build._id}, {$set: build}, {upsert: true});
    }
  }
});
