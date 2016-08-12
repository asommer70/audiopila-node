var fs = require('fs');
var db = require('./db');
var Pila = require('./pila');
var hostname = require('os').hostname().split('.').shift();

var Repo = {
  all: function(callback) {
    Pila.findByName(hostname, (pila) => {
      callback(pila.repositories);
    })
  }
}

module.exports = Repo;
