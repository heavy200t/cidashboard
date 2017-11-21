var express = require('express');
var mongoClient = require('mongodb');
var app = express();
var DB_STR = 'mongodb://localhost:27017';
var DB_CONN_STR = 'mongodb://shc-devops-master.hpeswlab.net:27017/failsafereports';


var sendFailsafeReports = function(res) {
  mongoClient.connect(DB_CONN_STR, function (err,db) {
    db.collection('reports').find().limit(10)
      .toArray(function (err, result){
        res.header("Access-Control-Allow-Origin", "*");
        res.set({'Content-Type':'text/json','Encodeing':'utf8'})
        res.send(result);
      });
    db.close();
  });
}

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/failsafereports', function (req, res) {
  sendFailsafeReports(res);
});



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
