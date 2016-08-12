var db = require('./db');
var Pila = require('./pila');

var hostname = require('os').hostname().split('.').shift();

var Audio = {
  all: function(callback) {
    Pila.findByName(hostname, (pila) => {
      callback(pila.audios);
    })
  },

  findBySlug: function(slug, callback) {
    Pila.findByName(hostname, (pila) => {
      callback(pila.audios[slug]);
    })
  },
}

module.exports = Audio;
