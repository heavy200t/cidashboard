db.system.js.insert({
  _id: 'calcPercent',
  value: function (value, total) {
    return Math.round(value * 10000 / total) / 100;
  }
});
