let page = require('webpage').create();
let today = new Date();
page.open('http://localhost:4200/dailyReport', function() {
  page.render('DailyReport_'+today.getFullYear()+today.getMonth()+today.getDate()+'.png');
  phantom.exit();
});
