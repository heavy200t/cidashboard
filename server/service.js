var mock_data = {summary: [
    {jobName: 'job1', buildId: 12, total: 120, pass: 23, fail: 97},
    {jobName: 'job2', buildId: 34, total: 30, pass: 23, fail: 7},
  ],
  newFailed: [
    {
      testClassName: "com.hp.automation.configuration.platform.ems.importFromFile.EMSImportMultiTenancyFlows",
      testName: "run"
    },
    {
      testClassName: "com.hp.automation.configuration.platform.ems.importFromFile.EMSImportMultiTenancyFlows",
      testName: "testIt"
    }
  ],
  top5: [
    {
      testClassName: "com.hp.automation.configuration.platform.ems.importFromFile.EMSImportMultiTenancyFlows",
      testName: "run",
      age: 58
    },
    {
      testClassName: "com.hp.automation.configuration.platform.ems.importFromFile.EMSImportMultiTenancyFlows",
      testName: "testIt",
      age: 49
    },
    {
      testClassName: "com.hp.automation.junit.search.topics.TopicsExtractionServiceTestAcc",
      testName: "testQNA",
      age: 30
    },
    {
      testClassName: "com.hp.automation.junit.search.topics.TopicsExtractionServiceTestAcc",
      testName: "testGetTopicsCache",
      age: 9
    },
    {
      testClassName: "com.hp.automation.junit.search.topics.TopicsExtractionServiceTestAcc",
      testName: "testAdHocEms",
      age: 1
    },
  ],
};

var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb');
var app = express();
var DB_STR = 'mongodb://localhost:27017';
var DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';
var pug = require('pug');
const compileFun = pug.compileFile('templates/mail.pug');

var sendRes = function (res, content) {
  res.header("Access-Control-Allow-Origin", "*");
  res.set({'Content-Type':'text/json','Encodeing':'utf8'})
  res.send(content);
}

var sendFailsafeReports = function(res, queryCriteria) {
  queryCriteria = queryCriteria || {};
  mongoClient.connect(DB_CONN_STR, function (err,db) {
    db.collection('reports').find(queryCriteria).limit(100)
      .toArray(function (err, result){
        sendRes(res, result);
      });
    db.close();
  });
}

var sendJobs;
sendJobs = function (res) {
  var today = new Date();
  var start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('reports').distinct("jobName", {insertionTime: {$gte: start}}).then(result => sendRes(res, result)
  )
    ;
  })
};

var sendBuilds = function(res, jobName){
  var today = new Date();
  var start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('reports').distinct("buildId", {insertionTime: {$gte: start}, jobName: jobName})
      .then(result => sendRes(res, result)
  )
  })
}

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/failsafereports/:jobName/:buildId', function (req, res) {
  sendFailsafeReports(res, {jobName: req.params.jobName, buildId: +req.params.buildId});
});

app.get('/api/jobs', function (req, res) {
  sendJobs(res);
});

app.get('/testmail', function(req, res){
  res.send(compileFun(mock_data));
});

app.get('/api/:jobName/builds', function (req, res) {
  sendBuilds(res, req.params.jobName);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
