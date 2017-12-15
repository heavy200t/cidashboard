const mock_data = require('./mock.json');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('templates/mail.pug');
const mongoClient = require('mongodb');
const DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';
const data = [];

const sendMail = function() {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      host: 'smtp3.hpe.com',
      port: 25
    });

    let mailOptions = {
      from: 'bpan@hpe.com',
      to: 'liangwei.yu@hpe.com, meic@hpe.com,bpan@hpe.com',
      subject: 'test mail',
      html: compileFunction(mock_data),
      attachments:[{
        filename: 'image001.png',
        path: 'templates/Dailyreport_20171215.png',
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

sendMail();

// console.info(getJobSummary('ITSMA-PR-X', 1029));
