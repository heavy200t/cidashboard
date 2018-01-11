'use strict';
const mongoClient = require('mongodb');
const utils = require('../utils/commonUtils');
const consts = require('../config/consts');
const request = require('request-promise');

function saveBuild (build) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(consts.DB_CONN_STR, function (err,db) {
      if (err !== null) {
        reject(err);
      }
      db.collection('builds').update({'_id': build._id}, build, {upsert: true})
        .then(result => {
          db.close();
          resolve(result);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  });
}

function saveJob(job) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(consts.DB_CONN_STR, function (err,db) {
      if (err !== null) {
        reject(err);
      }
      db.collection('jobs').update({'name': job.name}, job, {upsert: true})
        .then(result => {
          db.close();
          resolve(result);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  });
}

function queryBuildStatus(job, buildId) {
  let build = {};
  build._id = {};
  build._id.jobName = job.name;
  build._id.buildId = buildId;
  build.url = '{0}/{1}'.format(job.url, buildId);
  let req_opt = {
    uri: '{0}/api/json'.format(build.url),
    json: true
  };
  return new Promise((resolve, reject) => {
    request(req_opt)
      .then(res => {
        build.result = res.result;
        build.building = res.building;
        build.startTime = new Date(res.timestamp);
        build.description = res.description;
        build.duration = res.duration;
        resolve(build);
      })
      .catch(err => reject(err));
  });
}

exports.getJobs = function (req, res) {
      mongoClient.connect(consts.DB_CONN_STR, function (err, db) {
        db.collection('jobs').find().toArray()
          .then(result => utils.sendRes(res, result));
        db.close();
      });
};

exports.getBuilds = function(req, res){
  let jobName = req.params.jobName;
  let cond = utils.timeCondition("startTime", req.query['start'], req.query['end']);
  cond["_id.jobName"] = jobName;
  mongoClient.connect(consts.DB_CONN_STR, function (err, db) {
    db.collection('builds').find(cond).toArray()
      .then(result => {
        utils.sendRes(res, result);
        db.close();
      });
  })
};

exports.getBuildResult = function(req, res){
  let jobName = req.params.jobName;
  let buildId = parseInt(req.params.buildId);
  let condition = {"_id.jobName": jobName, "_id.buildId": buildId};
  mongoClient.connect(consts.DB_CONN_STR, function (err, db) {
    db.collection('builds').findOne(condition)
      .then(result => utils.sendRes(res, result));
    db.close();
  });
};

exports.getDailyReports = function(req, res){
  let s = req.query['start'];
  let e = req.query['end'];
  mongoClient.connect(consts.DB_CONN_STR, function (err, db) {
    db.collection('builds').find(utils.timeCondition("startTime", s, e)).toArray()
      .then(result => utils.sendRes(res, result));
    db.close();
  });
};

exports.calcDailyReports = function(req, res){
  let date = req.query['date'] ===undefined ? '': '"' + req.query['date'] + '"';
  let command = 'db.loadServerScripts(); calcBuilds(new Date("{0}"));'.format(date);
  mongoClient.connect(consts.DB_CONN_STR, function (err, db) {
    db.eval(command, function (err, result) {
      utils.sendRes(res, "Success.");
    });
    db.close();
  });
};

exports.updateStatus = function (req, res) {
  let job = {};
  job.lastUpdTime = new Date();
  job.name = req.body.name;
  job.url = consts.JENKINS_BASE_URL + req.body.url;
  job.phase = req.body.build.phase;
  switch (job.phase) {
    case 'STARTED': {
      job.running = true;
      break;
    }
    case 'COMPLETED': {
      job.running = false;
      break;
    }
    case 'FINALIZED': {
      job.running = false;
      break;
    }
  }

  job.latestBuild = req.body.build.number;
  queryBuildStatus(job, job.latestBuild)
    .then(build => {
      job.result = build.result;
      Promise.all([saveJob(job), saveBuild(build)]);
    })
    .then(r => utils.sendRes(res, 'OK'));
};

