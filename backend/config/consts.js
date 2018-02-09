module.exports = {
  JENKINS_BASE_URL: 'http://sh-maas-jenkins-master.hpeswlab.net:8080/jenkins/',
  DB_CONN_STR: 'mongodb://'+process.env.MONGO_SERVER+':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB,
  SELENIUM_HUB: 'http://shc-selenium-hub.hpeswlab.net:4444/wd/hub',
  URL_BASE: 'http://shc-devops-master.hpeswlab.net:30080/dailyReport/'
};
