const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('../templates/mail.pug');

const SELENIUM_HUB = 'http://shc-selenium-hub.hpeswlab.net:4444/wd/hub';
const URL_BASE = 'http://shc-devops-master.hpeswlab.net:30080/dailyReport/';



function sleep(delay) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delay);
    });
  }
}

const sendMail = function(fileName, url, cid) {
  return new Promise((resolve, reject) => {
    nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        host: 'smtp3.hpe.com',
        port: 25
      });

      let mailOptions = {
        from: 'test@hpe.com',
        to: 'bpan@hpe.com',
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

screenCapture()
  .then(forMail => sendMail(forMail.fileName, forMail.url, forMail.cid));




