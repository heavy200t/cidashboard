const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');

// var customPhantom = Capabilities.phantomjs();
// customPhantom.set('/usr/bin/phantomjs');
// var driver = new Builder().
//   withCapabilities(customPhantom).
//   build();
var pageWidth = 0;
var pageHeight = 0;
var driver = new Builder()
  .forBrowser('chrome')
  .usingServer('http://shc-selenium-hub.hpeswlab.net:4444/wd/hub')
  .build();

function sleep(delay) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delay);
    });
  }
}

let today = new Date();
let yesterday = new Date(today.setDate(today.getDate() - 1));
let str_yesterday = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString() + '-' + yesterday.getDate();
let url = 'http://shc-devops-master.hpeswlab.net:30080/dailyReport/' + str_yesterday;
let screenshotFileName = 'dailyReport_' + str_yesterday + '.png';

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
  .then(_ => driver.close());


