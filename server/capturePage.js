const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');
const nodemailer = require('nodemailer');
const pug = require('pug');
const compileFunction = pug.compileFile('../templates/mail.pug');

const SELENIUM_HUB = 'http://localhost:32768/wd/hub';
const URL_BASE = 'http://shc-devops-master.hpeswlab.net/dailyReport/';

var pageWidth = 0;
var pageHeight = 0;
var driver = new Builder()
  .forBrowser('chrome')
  .usingServer(SELENIUM_HUB)
  .build();

function sleep(delay) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delay);
    });
  }
}

const sendMail = function(fileName, url, cid) {
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
      html: compileFunction({"url": url, "cid": cid}),
      attachments:[{
        filename: 'image001.png',
        path: './' + fileName,
        contentTpe: 'image/png',
        contentDisposition: "inline",
        cid: cid
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

let today = new Date();
let yesterday = new Date(today.setDate(today.getDate() - 1));
let str_yesterday = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString() + '-' + yesterday.getDate();
let url = URL_BASE + str_yesterday;
let screenshotFileName = 'dailyReport_' + str_yesterday + '.png';
console.log(url);
driver.get(url)
  .then(_ => driver.findElement(By.tagName('app-daily-report')))
  .then(sleep(5000))
  .then(_ => driver.wait(until.elementIsVisible(driver.findElement(By.tagName('ag-grid-angular')))))
  .then(_ => driver.findElement(By.tagName('body')).getSize()
    .then((size) => {
      pageWidth = size.width;
      pageHeight = size.height;
    }))
  .then(_ => {
    console.log(pageWidth);
    console.log(pageHeight);
  })
  .then(_ => {
    driver.manage().window().setSize(pageWidth, pageHeight)
  })
  .then(
    _ => {
      driver.takeScreenshot().then(function (image,err) {
        require('fs').writeFile(screenshotFileName,image, 'base64', function (err) {
        });
      });
    }
  )
  .then(_ => driver.close())
  .then(_ => sendMail(screenshotFileName, url, str_yesterday));


