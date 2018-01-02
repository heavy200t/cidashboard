const express = require('express');
const request = require('request-promise');
const mongoClient = require('mongodb');
const app = express();
const JENKINS_BASE_URL = 'http://sh-maas-jenkins-master.hpeswlab.net:8080/jenkins/';
const DB_CONN_STR = 'mongodb://'+process.env.MONGO_SERVER+':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB ;

const bodyParser = require('body-parser');

const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('mail.pug');

const SELENIUM_HUB = 'http://shc-selenium-hub.hpeswlab.net:4444/wd/hub';
const URL_BASE = 'http://shc-devops-master.hpeswlab.net:30080/dailyReport/';

String.prototype.replaceAll = function (exp, newStr) {
  return this.replace(new RegExp(exp, "gm"), newStr);
};

String.prototype.format = function(args) {
  let result = this;
  if (arguments.length < 1) {
    return result;
  }

  let data = arguments; // 如果模板参数是数组
  if (arguments.length == 1 && typeof (args) == "object") {
    // 如果模板参数是对象
    data = args;
  }
  for ( let key in data) {
    let value = data[key];
    if (undefined != value) {
      result = result.replaceAll("\\{" + key + "\\}", value);
    }
  }
  return result;
}

var driver = new Builder()
  .forBrowser('chrome')
  .usingServer(SELENIUM_HUB)
  .build();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const timeCondition = function(field, s, e){
  /*
Date query scope is [s, e).
if s & e is not defined, it will query today's result.
if only s or e is defined, it will query one day's result([s, s+1) or [e-1, e) )
 */
  let condition = {}
  condition[field] = {};
  // let condition = {field:{}};

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

  condition[field].$gte = start;
  condition[field].$lt = end;
  return condition;
}

const sendRes = function (res, content) {
  res.header("Access-Control-Allow-Origin", "*");
  res.set({'Content-Type':'text/json','Encodeing':'utf8'});
  res.send(content);
};

const queryBuildStatus = function (job, buildId) {
  let build = {};
  build._id = {};
  build._id.jobName = job.name;
  build._id.buildId = buildId;
  build.url = '{0}/{1}'.format(job.url, buildId);
  let req_opt = {
    uri: '{0}/api/json'.format(build.url),
    json: true
  }
  return new Promise((resolve, reject) => {
    request(req_opt)
      .then(res => {
        build.result = res.result;
        build.building = res.building;
        build.startTime = new Date(res.timestamp);
        resolve(build);
      })
      .catch(err => reject(err));
  });
}

const saveBuild = function(build) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(DB_CONN_STR, function (err,db) {
      if (err != null) {
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

const saveJob = function(job) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(DB_CONN_STR, function (err,db) {
      if (err != null) {
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

const getMailReceivers = function() {
  return new Promise((resolve, reject) => {
    mongoClient.connect(DB_CONN_STR, function (err,db) {
      db.collection('settings').findOne().then(
        setting => resolve(setting.mail.receivers)
      )
    });
  });
}

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
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('jobs').find().toArray()
      .then(result => sendRes(res, result));
    db.close();
  })
};

const sendBuilds = function(res, jobName, s, e){
  let cond = timeCondition("startTime", s, e);
  cond["_id.jobName"] = jobName;
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('builds').find(cond).toArray()
      .then(result => {
        sendRes(res, result);
        db.close();
      });
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

const sendJobResult = function(res, name, buildId){
  let condition = {"_id.jobName": name, "_id.buildId": buildId};
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('builds').findOne(condition)
      .then(result => sendRes(res, result));
    db.close();
  });
};

const sendDailyReports = function(res, s, e){
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.collection('builds').find(timeCondition("startTime", s, e)).toArray()
      .then(result => sendRes(res, result));
    db.close();
  });
};

const calcDailyReports = function(res, d){
  let date = '';
  if (d != undefined) {
    date = '"' +d+ '"';
  };
  let command = 'db.loadServerScripts(); calcBuilds(new Date(' + date + '));'
  mongoClient.connect(DB_CONN_STR, function (err, db) {
    db.eval(command, function (err, result) {
      sendRes(res, "Success.");
    });
    db.close();
  });
};

const sleep = function(delay) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delay);
    });
  }
}

const sendMail = function(fileName, url, cid) {
  return new Promise((resolve, reject) => {
    getMailReceivers().then(
      receivers => {
        nodemailer.createTestAccount((err, account) => {
          let transporter = nodemailer.createTransport({
            host: 'smtp3.hpe.com',
            port: 25
          });

          let mailOptions = {
            from: 'noreply@hpe.com',
            to: receivers,
            subject: 'Automation daily report - ' + cid,
            html: compileFunction({url: url, cid: cid}),
            attachments:[{
              filename: fileName,
              path: './' + fileName,
              contentTpe: 'image/png',
              contentDisposition: "inline",
              cid: cid
            }]
          };
          console.log(compileFunction({url: url, cid: cid}));
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve('Mail sent!')
            }
          });
        });
      }
    );
  });
};

const screenCapture = function () {
  return new Promise(resolve => {
    var driver = new Builder()
      .forBrowser('chrome')
      .usingServer(SELENIUM_HUB)
      .build();
    let today = new Date();
    let yesterday = new Date(today.setDate(today.getDate() - 1));
    let str_yesterday = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString() + '-' + yesterday.getDate();
    let url = URL_BASE + str_yesterday;
    let screenshotFileName = 'dailyReport_' + str_yesterday + '.png';
    console.log(screenshotFileName);
    console.log(url);
    console.log(str_yesterday);
    driver.manage().window().setSize(1240, 2048);
    driver.get(url)
      .then(_ => driver.findElement(By.tagName('app-job-list')))
      .then(sleep(20000))
      .then(
        _ => {
          driver.takeScreenshot().then(function (image,err) {
            require('fs').writeFile(screenshotFileName,image, 'base64', function (err) {
            });
          });
        }
      )
      .then(_ => {
        driver.close();
        resolve({fileName: screenshotFileName, url: url, cid: str_yesterday});
      })
  });
}

const updateStatus = function (req, res) {
  let job = {};
  job.lastUpdTime = new Date();
  job.name = req.body.name;
  job.url = JENKINS_BASE_URL + req.body.url;
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

      Promise.all([saveJob(job), saveBuild(build)])
    })
    .then(r => sendRes(res, r));
}

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/failsafereports/:jobName/:buildId', function (req, res) {
  sendFailsafeReports(res, {jobName: req.params.jobName, buildId: +req.params.buildId});
});

app.get('/api/job/:jobName/:buildId', function (req, res) {
  sendJobResult(res, req.params.jobName,parseInt(req.params.buildId));
});

app.get('/api/jobs', function (req, res) {
  sendJobs(res);
});

app.get('/api/dailyReports', function (req, res) {
  sendDailyReports(res, req.query['start'], req.query['end']);
});

app.get('/api/dailyReportMail', function (req, res) {
  screenCapture()
    .then(forMail => sendMail(forMail.fileName, forMail.url, forMail.cid))
    .then(message => res.send(message));
});

app.get('/api/:jobName/builds', function (req, res) {
  sendBuilds(res, req.params.jobName, req.query['start'], req.query['end']);
});

app.get('/api/calcDailyReport', function (req, res)  {
  calcDailyReports(res, req.query['date']);
});

app.get('/api/mailReceivers', function (req, res) {
  getMailReceivers().then(receivers => res.send(receivers));
});

app.post('/updateStatus/masters', function (req, res) {
  updateStatus(req, res);
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
