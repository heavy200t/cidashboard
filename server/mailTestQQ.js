const mock_data = require('./mock.json');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('templates/mail.pug');
const mongoClient = require('mongodb');
const DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';
const data = [];

mock_data.jobs.forEach(job => job.detail.forEach(
  i => {
    let list = i._id.category.split('/');
    i._id.category = list[list.length-1];
    let idx =  i._id.reportUrl.indexOf('TEST_TYPE=');
    if (idx != -1) {
      i.type = i._id.reportUrl.substring(idx+10).split(',')[0];
    }
  }
));

const sendMail = function(data) {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      service: 'qq',
      auth: {
        user: '3716743@qq.com',
        pass: 'ondxxgkwiieucafc' //授权码,通过QQ获取

      }
    });

    let mailOptions = {
      from: '3716743@qq.com',
      to: 'bpan@hpe.com',
      subject: 'test mail',
      html: compileFunction(data),
      attachments:[{
        filename: 'image001.png',
        path: 'templates/image001.png',
        contentTpe: 'image/png',
        contentDisposition: "inline",
        cid: '0000001'
      }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.message);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  });
};

const getJobSummary = function(db, jobName, buildId) {
  db.collection('reports').aggregate([
      {$match: {"jobName": jobName, "buildId": buildId}},
      {$group: {
        _id: {category: "$category", reportUrl: "$testReportUrl"},
        total: {$sum: 1},
        pass: {$sum: {$cond: {if: "$testFailed", then: 0, else: 1}}},
        fail: {$sum: {$cond: {if: "$testFailed", then: 1, else: 0}}},
        unstable: {$sum: {$cond: {if: "$markedUnstable", then: 1, else: 0}}}
      }}
    ],
    function(err,result) {
      data.append({"summary": result});
      db.close();
    }
  );
};

// mongoClient.connect(DB_CONN_STR, function (err,db) {
//   getJobSummary(db, 'ITSMA-PR-X', 1029);
// });

// console.info(getJobSummary('ITSMA-PR-X', 1029));
sendMail(mock_data)
