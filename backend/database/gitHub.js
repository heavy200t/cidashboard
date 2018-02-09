const GITHUB_TOKEN = '3ebcecc1def33e6c9e50adc20ba62011a828e38d';
const GITHUB_HOST = 'github.houston.softwaregrp.net';
let https = require('https');

module.exports.query = function(gql, variables) {
  return new Promise((resolve, reject) => {
    let req = https.request({
      host: GITHUB_HOST,
      port: 443,
      path: '/api/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'token ' + GITHUB_TOKEN
      }
    }, function(res){
      if(res.statusCode !== 200) {reject(res)}
      res.on('data',function (d) {
        resolve(d.toString());
      });
      res.on('error', function(e){
        reject(e);
      });
    });

    let q = JSON.stringify({
      query: 'query ' + gql,
      variables: variables
    });
    // console.log(q);
    req.write(q);

    req.end();
  });
};


