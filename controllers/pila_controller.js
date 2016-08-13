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
  Pila.deletePila(req.params.name, (pilas) => {
    res.json({message: 'Pila successfully deleted.', pilas: pilas});
  })
}

exports.sync = function(req, res, next) {
  // Update the local pila entry with httpUrl, lastSynced, syncedFrom, and Audios?
  var me = {
    name: hostname,
    baseUrl: req.protocol + '://' + req.get('host'),
    syncUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    syncedFrom: req.body.name,
  }

  // Get Me
  Pila.findByName(hostname, (pila) => {
    console.log('syncing:', req.body.name);
    for (var attrname in pila) { me[attrname] = pila[attrname]; }
    me.lastSynced = Date.now();

    // Update Me
    Pila.updatePila(me, (pila) => {
      console.log('Updated me...');

      // Try and find and update the new Pila, or if it's not there add it.
      Pila.findByName(req.body.name, (pila) => {
        if (pila == null) {
          Pila.addPila(req.body, (pilas) => {
            // Update Audios
            Pila.updateLocalAudios(req.body.audios, me.audios, (audios) => {
              me.audios = audios;

              Pila.updatePila(me, (pila) => {
                res.json({message: 'Sync successful.', pila: pila});
              });
            })
          })
        } else {
          console.log('updating pilas...');

          // Update synced Pila.
          Pila.updatePila(req.body, (pila) => {
            Pila.updateLocalAudios(pila.audios, me.audios, (audios) => {
              me.audios = audios;

              Pila.updatePila(me, (pila) => {
                res.json({message: 'Sync successful.', pila: pila});
              })
            })
          })
        }
      })
    })
  });
}
