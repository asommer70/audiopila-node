var config = require('../config');

var store = {};
switch (config.db) {
  case 'postgresql':
    console.log('store dialect is PosgreSQL...');
    store = require('./postgresql');
    store.repo = require('./local').repo;
    break;
  default:
    console.log('store dialect is local nedb...');
    store.db = require('./local');
    store.pila = require('./local').pila;
    store.audio = require('./local').audio;
    store.repo = require('./local').repo;
}

module.exports = store;
