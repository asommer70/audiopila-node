var config = require('../config')[process.env.ENV];

var store = {};
switch (config.db) {
  case 'postgres':
    console.log('store dialect is PosgreSQL...');
    store.pila = require('./postgres/pila');
    store.audio = require('./postgres/audio');
    store.repo = require('./postgres/repo');
    store.playlist = require('./postgres/playlist');
    break;
  default:
    console.log('store dialect is local nedb...');
    store.db = require('./local');
    store.pila = require('./local').pila;
    store.audio = require('./local').audio;
    store.repo = require('./local').repo;
}

module.exports = store;
