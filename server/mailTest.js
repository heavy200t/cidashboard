const mock_data = require('./mock.json');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('templates/mail.pug');
const mongoClient = require('mongodb');
const DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';
const data = [];

const sendMail = function(data) {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      host: 'smtp3.hpe.com',
      port: 25
    });

    let mailOptions = {
      from: 'test@hpe.com',
      to: 'bpan@hpe.com, meic@hpe.com',
      subject: 'test mail',
      html: compileFunction(mock_data),
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

mongoClient.connect(DB_CONN_STR, function (err,db) {
  getJobSummary(db, 'ITSMA-PR-X', 1029);
});

// console.info(getJobSummary('ITSMA-PR-X', 1029));
