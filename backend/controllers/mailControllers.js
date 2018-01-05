'use strict';
const mongoClient = require('mongodb');
const nodemailer = require('nodemailer');
const pug = require('pug');
const utils = require('../utils/commonUtils');
const screenCapture = require('../utils/screenCapture');
const consts = require('../config/consts');


function queryMailReceivers() {
  return new Promise((resolve, reject) => {
    mongoClient.connect(consts.DB_CONN_STR, function (err,db) {
      db.collection('settings').findOne().then(
        setting => resolve(setting.mail.receivers)
      )
    });
  });
}

const compileFunction = pug.compileFile('mail.pug', {});

function sendMail (fileName, url, cid) {
  return new Promise((resolve, reject) => {
    queryMailReceivers().then(
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

exports.getMailReceivers = function(req, res) {
  queryMailReceivers().then(receivers => utils.sendRes(res, receivers));
}

exports.dailyReportMail = function (req, res) {
  screenCapture.run()
    .then(forMail => sendMail(forMail.fileName, forMail.url, forMail.cid))
    .then(message => res.send(message));
}
