var express = require('express');
var mongoClient = require('mongodb');
var app = express();
var DB_STR = 'mongodb://localhost:27017';

app.get('/', function (req, res) {
  res.send('Hello World!');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
