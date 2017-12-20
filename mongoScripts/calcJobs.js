db.system.js.remove({_id: 'calcJobs'});
db.system.js.insert({
  _id: "calcJobs",
  value: function (start) {
    db.loadServerScripts();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start = new Date(start);
    end = new Date(start);
    end.setDate(end.getDate() + 1 );
    var data = db.reports.aggregate([
      {$match: {"insertionTime": {$gte: start, $lt: end}}},
      {$group: {
        _id: {jobName: "$jobName", buildId: "$buildId"},
        total: {$sum: 1},
        pass: {$sum: {$cond: {if: "$testFailed", then:0, else: 1}}},
        fail: {$sum: {$cond: {if: "$testFailed", then:1, else: 0}}},
        unstable: {$sum: {$cond: {if: "$markedUnstable", then:1, else: 0}}},
        startTime: {$min: "$insertionTime"}
      }}
    ]);
    while(data.hasNext()){
      var job = data.next();
      job.pass_percent = calcPercent(job.pass, job.total);
      job.fail_percent = calcPercent(job.fail, job.total);
      job.unstable_percent = calcPercent(job.unstable, job.total);
      job.detail = calcJobDetails(job);
      db.jobs.remove({"_id": job._id});
      db.jobs.insert(job);
    }
  }
});
