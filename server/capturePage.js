const {Builder, By, Key, until, Capabilities}  = require('selenium-webdriver');

// var customPhantom = Capabilities.phantomjs();
// customPhantom.set('/usr/bin/phantomjs');
// var driver = new Builder().
//   withCapabilities(customPhantom).
//   build();
var driver = new Builder()
  .forBrowser('phantomjs')
  .usingServer('http://localhost:32771/wd/hub')
  .build();

function sleep(delay) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delay);
    });
  }
}

function sleep1(text, delay) {
  return function() {return new Promise(resolve => {
    setTimeout(_ => {
      console.log(text);
      resolve();
    },delay);
  })}
}


driver.get('http://shc-devops-master.hpeswlab.net/dailyReport')
// driver.get('http://localhost/dailyReport')
  .then(_ => driver.findElement(By.tagName('app-daily-report')))
  .then(_ => driver.wait(until.elementIsVisible(driver.findElement(By.tagName('ag-grid-angular')))))
  .then(sleep(10000))
  .then(
    _ => {
      driver.takeScreenshot().then(function (image,err) {
        require('fs').writeFile('test.png',image, 'base64', function (err) {
        });
      });
      // setTimeout(function () {
      //
      // }, 10000);
    }
  )
  // .then(_ => {setTimeout(
  //             driver.takeScreenshot().then(
  //               function (image,err) {
  //                 require('fs').writeFile('test.png', image, 'base64', function (err) {console.log(err);});
  //               })}))
  .then(_ => driver.close());
// driver.takeScreenshot().then(

//   );

