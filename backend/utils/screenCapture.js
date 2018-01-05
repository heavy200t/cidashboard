const consts = require('../config/consts');
const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');

exports.run = function () {
  return new Promise(resolve => {
    let driver = new Builder()
      .forBrowser('chrome')
      .usingServer(consts.SELENIUM_HUB)
      .build();
    let today = new Date();
    let yesterday = new Date(today.setDate(today.getDate() - 1));
    let str_yesterday = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString() + '-' + yesterday.getDate();
    let url = consts.URL_BASE + str_yesterday;
    let screenshotFileName = 'dailyReport_' + str_yesterday + '.png';
    console.log(screenshotFileName);
    console.log(url);
    console.log(str_yesterday);
    driver.manage().window().setSize(1240, 2048);
    driver.get(url)
      .then(_ => driver.findElement(By.tagName('app-job-list')))
      .then(driver.sleep(20000))
      .then(
        () => {
          driver.takeScreenshot().then(function (image,err) {
            require('fs').writeFile(screenshotFileName,image, 'base64', function (err) {
            });
          });
        }
      )
      .then(() => {
        driver.close();
        resolve({fileName: screenshotFileName, url: url, cid: str_yesterday});
      });
  });
};
