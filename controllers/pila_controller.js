var DataApi = require('../lib/data_api');
var Pila = require('../models/pila');

var hostname = require('os').hostname().split('.').shift();

exports.pilas = function(req, res, next) {
  Pila.all((pilas) => {
    res.json(pilas);
  })
}

exports.pila = function(req, res, next) {
  Pila.findByName(req.params.name, (pila) => {
    if (!pila) {
      return res.status(404).json({message: 'Pila not found...'});
    }
    res.json(pila);
  })
}

exports.deletePila = function(req, res, next) {
  DataApi.deletePila(req.params.name, (data) => {
    res.json(data);
  })
}
