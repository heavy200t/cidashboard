const mock_data = require('./mock.json');
const express = require('express');
const mongoClient = require('mongodb');
const app = express();
const DB_CONN_STR = 'mongodb://'+process.env.MONGO_SERVER+':' + process.env.MONGO_PORT + '/failsafereports';

const sendRes = function (res, content) {
  res.header("Access-Control-Allow-Origin", "*");
  res.set({'Content-Type':'text/json','Encodeing':'utf8'});
  res.send(content);
};

const sendFailsafeReports = function(res, queryCriteria) {
  queryCriteria = queryCriteria || {};
  mongoClient.connect(DB_CONN_STR, function (err,db) {
    db.collection('reports').find(queryCriteria).limit(100)
      .toArray(function (err, result){
        sendRes(res, result);
      });
    db.close();
  });
};

const sendJobs = function (res) {
  let today = new Date();
  let start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('reports').
      distinct("jobName", {insertionTime: {$gte: start}})
      .then(result => sendRes(res, result));
    db.close();
  })
};

const sendBuilds = function(res, jobName){
  let today = new Date();
  let start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('jobs').distinct("jobName", {insertionTime: {$gte: start}, jobName: jobName})
      .then(result => sendRes(res, result));
    db.close();
  })
};

const sendDailyReports_mock = function(res, s, e){
  mock_data.jobs.forEach(job => job.detail.forEach(
    i => {
      let list = i._id.category.split('/');
      i._id.category = list[list.length-1];
      let idx =  i._id.reportUrl.indexOf('TEST_TYPE=');
      if (idx != -1) {
        i.type = i._id.reportUrl.substring(idx+10).split(',')[0];
      }
    }));
  sendRes(res, mock_data.jobs);
}
const sendDailyReports = function(res, s, e){
  /*
  Date query scope is [s, e).
  if s & e is not defined, it will query today's result.
  if only s or e is defined, it will query one day's result([s, s+1) or [e-1, e) )
   */
  let condition = {"startTime":{}};

  let start = new Date();
  start = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  if ( s != undefined) {
    start = new Date(Date.parse(s.replace(/-/g, "/")));
  }

  let end = new Date(start);
  end.setDate(end.getDate() + 1);

  if ( e != undefined) {
    end = new Date(Date.parse(e.replace(/-/g, "/")));
    end.setDate(end.getDate() + 1);
    if (s == undefined) {
      start = new Date(end);
      start.setDate(start.getDate() - 1);
    }

  }

  condition["startTime"].$gte = start;
  condition["startTime"].$lt = end;

  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('jobs').find(condition).toArray()
      .then(result => {
        result.forEach(job => job.detail.forEach(
          i => {
            let list = i._id.category.split('/');
            i._id.category = list[list.length-1];
            let idx =  i._id.reportUrl.indexOf('TEST_TYPE=');
            if (idx != -1) {
              i.type = i._id.reportUrl.substring(idx+10).split(',')[0];
            }
          }
        ));
        sendRes(res, result);
      });
    db.close();
  });
};

const calcDailyReports = function(res, d){
  let date = '';
  if (d != undefined) {
    date = '"' +d+ '"';
  };
  let command = 'db.loadServerScripts(); calcJobs(new Date(' + date + '));'
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.eval(command, function (err, result) {
      sendRes(res, "Success.");
    });
    db.close();
  });
};

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/failsafereports/:jobName/:buildId', function (req, res) {
  sendFailsafeReports(res, {jobName: req.params.jobName, buildId: +req.params.buildId});
});

app.get('/api/jobs', function (req, res) {
  sendJobs(res);
});

app.get('/api/dailyReports', function (req, res) {
  sendDailyReports_mock(res, req.query['start'], req.query['end']);
});

app.get('/api/:jobName/builds', function (req, res) {
  sendBuilds(res, req.params.jobName);
});

app.get('/api/calcDailyReport', function (req, res)  {
  calcDailyReports(res, req.query['date']);
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
