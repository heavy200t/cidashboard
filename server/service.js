const express = require('express');
const mongoClient = require('mongodb');
const app = express();
const FAILSAFE_DB_CONN_STR = 'mongodb://'+process.env.MONGO_SERVER+':' + process.env.MONGO_PORT + '/failsafereports';
const SETTINGS_DB_CONN_STR = 'mongodb://'+process.env.MONGO_SERVER+':' + process.env.MONGO_PORT + '/settings';


const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('mail.pug');

const SELENIUM_HUB = 'http://shc-selenium-hub.hpeswlab.net:4444/wd/hub';
const URL_BASE = 'http://shc-devops-master.hpeswlab.net:30080/dailyReport/';

var driver = new Builder()
  .forBrowser('chrome')
  .usingServer(SELENIUM_HUB)
  .build();

const sendRes = function (res, content) {
  res.header("Access-Control-Allow-Origin", "*");
  res.set({'Content-Type':'text/json','Encodeing':'utf8'});
  res.send(content);
};

const getMailReceivers = function() {
  return new Promise((resolve, reject) => {
    console
    mongoClient.connect(SETTINGS_DB_CONN_STR, function (err,db) {
      db.collection('mail').find().toArray(function (err, result) {
        resolve(result[0].receivers);
      })
    });
  });
}

const sendFailsafeReports = function(res, queryCriteria) {
  queryCriteria = queryCriteria || {};
  mongoClient.connect(FAILSAFE_DB_CONN_STR, function (err,db) {
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
  mongoClient.connect(FAILSAFE_DB_CONN_STR, function (err, db) {
    db.collection('reports').
      distinct("jobName", {insertionTime: {$gte: start}})
      .then(result => sendRes(res, result));
    db.close();
  })
};

const sendBuilds = function(res, jobName){
  let today = new Date();
  let start = new Date(today.setDate(today.getDate() - 7));
  mongoClient.connect(FAILSAFE_DB_CONN_STR, function (err, db) {
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

  mongoClient.connect(FAILSAFE_DB_CONN_STR, function (err, db) {
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
  mongoClient.connect(FAILSAFE_DB_CONN_STR, function (err, db) {
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
    driver.manage().window().setSize(1240, 1024);
    driver.get(url)
      .then(_ => driver.findElement(By.tagName('app-daily-report')))
      .then(sleep(5000))
      .then(_ => driver.wait(until.elementIsVisible(driver.findElement(By.tagName('ag-grid-angular')))))
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
  sendDailyReports(res, req.query['start'], req.query['end']);
});

app.get('/api/dailyReportMail', function (req, res) {
  screenCapture()
    .then(forMail => sendMail(forMail.fileName, forMail.url, forMail.cid))
    .then(message => res.send(message));
});

app.get('/api/:jobName/builds', function (req, res) {
  sendBuilds(res, req.params.jobName);
});

app.get('/api/mailReceivers', function (req, res) {
  getMailReceivers().then(receivers => res.send(receivers));
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
