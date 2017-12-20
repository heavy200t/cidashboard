db.system.js.remove({_id: 'getType'});
db.system.js.insert({
  _id: 'getType',
  value: function getType(t){
    var idx = t.indexOf('TEST_TYPE=');
    if (idx != -1) {
      return t.substring(idx+10).split(',')[0];
    } else {
      return undefined;
    }
  }
});
