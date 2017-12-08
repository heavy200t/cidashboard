var page = require('webpage').create();
page.open('http://www.baidu.com/', function() {
  page.render('github.png');
  phantom.exit();
});
