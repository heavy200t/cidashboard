const {Builder, By, Key, until}  = require('selenium-webdriver');


var driver = new Builder()
  .forBrowser('firefox')
  .build();

driver.get('http://shc-devops-master.hpeswlab.net:30080/dailyReport')
// driver.get('http://localhost:4200/dashboard')
  .then(_ => driver.findElement(By.tagName('app-root')))
  .then(_ => driver.takeScreenshot().then(
    function (image,err) {
      require('fs').writeFile('test.png', image, 'base64', function (err) {
        console.log(err);
      })
    }
  ))
  .then(_ => driver.close());
// driver.takeScreenshot().then(

//   );

