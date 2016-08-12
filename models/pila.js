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
        callback(pila[name]);
      }
    })
  },

  addPila: function(pila, callback) {
    pila.type = 'pila';
    db.insert(pila, function (err, doc) {
      db.find({type: 'pila'}, function (err, docs) {
        var pilas = db.makeObject(docs, 'name');
        callback(pilas);
      });
    });
  },

  updatePila: function(pila, callback) {
    db.update({ name: pila.name }, pila, {}, (err, numReplaced) => {
      if (err) {
        console.log('updatePila find err:', err);
      }

      this.findByName(pila.name, (pila) => {
        callback(pila);
      });
    })
  },

  deletePila: (name, callback) => {
    this.findByName(name, (pilas) => {
      if (pilas) {
        db.remove({type: 'pila', name: pilas[name]}, (err, numRemoved) => {
          if (err) {
            console.log('deletePila err:', err);
            callback({message: 'Unable to delete Pila...'});
          } else {
            this.all((pilas) => {
              callback({message: 'Pila successfully deleted.', pilas: pilas});
            })
          }
        })
      }
    })
  },
}

module.exports = Pila;
