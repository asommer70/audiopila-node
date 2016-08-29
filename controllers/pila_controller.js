var fs = require('fs');
var request = require('request');

var Pila = require('../models').pila;
var Audio = require('../models').audio;
var Player = require('../models/player');

var hostname = require('os').hostname().split('.').shift();

exports.pilas = function(req, res, next) {
  // Pila.all((pilas) => {
  //   res.json(pilas);
  // })
  // var a = Pila.all()
  // console.log('a:', a);
  Pila.all()
    .then((pilas) => {
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

exports.status = function(req, res, next) {
  Pila.findByName(hostname, (pila) => {
    var player = {
      state: Player.state || 'stopped',
    }
    if (Player.audio !== undefined) {
      player.audio = Player.audio;
      player.state = Player.state;
    } else {
      var sortable = [];
      for (var slug in pila.audios) {
        sortable.push(pila.audios[slug])
      }

      sortable.sort(function(a, b) {
        if (a.playedTime !== undefined && b.playedTime !== undefined) {
          return b.playedTime - a.playedTime;
        } else {
          return -1
        }
      })

      player.audio = sortable[0];
    }

    res.json({player: player, pila: pila});
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

exports.upload = function(req, res, next) {
  if (req.busboy) {
    req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
      if (key == 'slug') {
        req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          Pila.findByName(hostname, (pila) => {
            if (pila) {
              var repo = pila.repositories[value];

              fstream = fs.createWriteStream(repo.path + '/' + filename);
              file.pipe(fstream);
              fstream.on('close', () => {
                console.log(filename + ' uploaded to: ' + repo.path)

                // Update the Pila.audios list.
                Audio.add(repo.name, repo.path, req.protocol + '://' + req.get('host'), (audios) => {
                  res.json({message: 'Successfully added audios.', audios: audios});
                })

              });
            } else {
              res.json({message: 'Audio could not be uploaded.'});
            }
          })
        });
      }
    });
  } else {
    res.json({message: 'Bad luck no busboy...'})
  }
}
