var dbConfig = require('../../config/db');

var store;
switch (dbConfig.dialect) {
  case 'postgresql':
    console.log('store dialect is PosgreSQL...');
    var store = require('./postgresql');
    break;
  default:
    console.log('store dialect is local nedb...');
    var store = require('./local');
}

module.exports = store;
