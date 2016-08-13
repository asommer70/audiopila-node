var db = require('./db');

var Pila = {
  all: function(callback) {
    db.find({type: 'pila'}, (error, docs) => {
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

  updateLocalAudios: function(remoteAudios, localAudios, callback) {
    for (var key in remoteAudios) {
      var remoteAudio = remoteAudios[key];
      var localAudio = localAudios[key];

      if (localAudio != undefined) {
        if (localAudio.playedTime != undefined) {
          if (remoteAudio.playedTime > localAudio.playedTime) {
            localAudios[key].playbackTime = remoteAudio.playbackTime;
          }
        } else {
          localAudios[key].playbackTime = remoteAudio.playbackTime;
        }
      }
    }
    callback(localAudios);
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
              callback(pilas);
            })
          }
        })
      }
    })
  },
}

module.exports = Pila;
