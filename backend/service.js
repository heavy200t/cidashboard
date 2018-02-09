// TODO: import test suites from excel
// TODO: Test age
// TODO: new failed tests
// TODO: Top 5 failed tests
const express = require('express');
const utils = require('./utils/commonUtils');
const app = express();
const bodyParser = require('body-parser');
let cors = require('cors');

utils.init();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes/routes')(app);
require('./graphql/graphql')(app);

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Server is listening at http://%s:%s', host, port);
});
