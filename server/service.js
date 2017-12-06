const mock_data = require('./mock.json');
const express = require('express');
// const bodyParser = require('body-parser');
const mongoClient = require('mongodb');
const app = express();
// const DB_STR = 'mongodb://localhost:27017';
const DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';
const pug = require('pug');
const compileFun = pug.compileFile('templates/mail.pug');

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
    db.collection('reports').distinct("jobName", {insertionTime: {$gte: start}}).then(result => sendRes(res, result)
  )
    ;
  })
};

const sendBuilds = function(res, jobName){
  let today = new Date();
  let start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('reports').distinct("buildId", {insertionTime: {$gte: start}, jobName: jobName})
      .then(result => sendRes(res, result)
  )
  })
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

app.get('/testmail', function(req, res){
  res.send(compileFun(mock_data));
});

app.get('/api/:jobName/builds', function (req, res) {
  sendBuilds(res, req.params.jobName);
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
