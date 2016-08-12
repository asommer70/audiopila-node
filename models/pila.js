var db = require('./db');

var Pila = {
  all: function(callback) {
    db.find({type: 'pila'}, (error, docs) => {
      console.log('db.find docs:', docs);
      if (error) {
        console.log('getPilas error:', error);
      }

      var pilas = db.makeObject(docs, 'name')
      callback(pilas);
    })
  },

  findByName: function(name, callback) {
    db.find({name: name, type: 'pila'}, function(error, docs) {
      if (docs.length == 0) {
        callback(null);
      } else {
        var pila = db.makeObject(docs, 'name')
        callback(pila);
      }
    })
  }
}

module.exports = Pila;
