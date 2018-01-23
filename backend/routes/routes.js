let jobCtrl = require('../controllers/jobControllers');
let mailCtrl = require('../controllers/mailControllers');
module.exports = function(app){
  app.get('/ping', function (req, res) {res.send('Hello World!')});

  app.get('/api/job/:jobName/:buildId', jobCtrl.getBuildResult.bind(jobCtrl));

  app.get('/api/jobs', jobCtrl.getJobs.bind(jobCtrl));

  app.get('/api/dailyReports', jobCtrl.getDailyReports.bind(jobCtrl));

  app.get('/api/migrateReports', jobCtrl.migrateReports.bind(jobCtrl));

  app.get('/api/dailyReportMail', mailCtrl.dailyReportMail.bind(mailCtrl));

  app.get('/api/:jobName/builds', jobCtrl.getBuilds.bind(jobCtrl));

  app.get('/api/calcDailyReport', jobCtrl.calcDailyReports.bind(jobCtrl));

  app.get('/api/mailReceivers', mailCtrl.getMailReceivers.bind(mailCtrl));

  app.post('/updateStatus/masters', jobCtrl.updateStatus.bind(jobCtrl));
};
