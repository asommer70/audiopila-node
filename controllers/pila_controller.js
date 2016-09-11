var Pila = require('../models').pila;
var Audio = require('../models').audio;
var Player = require('../models/player');
var Sync = require('../lib/sync');
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

exports.pilas = function(req, res, next) {
  Pila.all()
    .then((pilas) => {
      res.json(pilas);
    })
}

exports.pila = function(req, res, next) {
  Pila.findByName(req.params.name)
    .then((pila) => {
      if (!pila) {
        return res.status(404).json({message: 'Pila not found...'});
      }
      res.json(pila);
  })
}

exports.status = function(req, res, next) {
  Pila.findByName(hostname)
    .then((pila) => {
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
  Pila.findByName(hostname)
    .then((pila) => {
      pila.destroy()
        .then((pila) => {
          res.redirect('/pilas');
        })
        .catch((error) => {
          res.status(500).json({message: 'Pila not deleted.', detail: error.detail, code: error.code, constraint: error.constraint})
        })
    })
}

exports.sync = function(req, res, next) {
  var urls = [req.protocol + '://' + req.get('host'), req.originalUrl];
  Sync.now(req.body, urls)
    .then((pila) => {
      res.json({message: 'Sync successful.', pila: pila});
    })

  // // Update the local pila entry with httpUrl, lastSynced, syncedFrom, and Audios?
  // var me = {
  //   name: hostname,
  //   baseUrl: req.protocol + '://' + req.get('host'),
  //   syncUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
  //   syncedFrom: req.body.name,
  // }
  //
  // // Get Me
  // Pila.findByName(hostname)
  //   .then((pila) => {
  //     console.log('syncing:', req.body.name);
  //     for (var attrname in pila) { me[attrname] = pila[attrname]; }
  //     me.lastSynced = Date.now();
  //
  //     // Update Me
  //     Pila.updatePila(me, (pila) => {
  //       console.log('Updated me...');
  //
  //       // Try and find and update the new Pila, or if it's not there add it.
  //       Pila.findByName(req.body.name, (pila) => {
  //         if (pila == null) {
  //           Pila.addPila(req.body, (pilas) => {
  //             // Update Audios
  //             Pila.updateLocalAudios(req.body.audios, me.audios, (audios) => {
  //               me.audios = audios;
  //
  //               Pila.updatePila(me, (pila) => {
  //                 res.json({message: 'Sync successful.', pila: pila});
  //               });
  //             })
  //           })
  //         } else {
  //           console.log('updating pilas...');
  //
  //           // Update synced Pila.
  //           Pila.updatePila(req.body, (pila) => {
  //             Pila.updateLocalAudios(pila.audios, me.audios, (audios) => {
  //               me.audios = audios;
  //
  //               Pila.updatePila(me, (pila) => {
  //                 res.json({message: 'Sync successful.', pila: pila});
  //               })
  //             })
  //           })
  //         }
  //       })
  //     })
  //   });
}

exports.upload = function(req, res, next) {
  var fs = require('fs');
  var probe = require('node-ffprobe');

  if (req.busboy) {
    req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
      if (key == 'slug') {
        req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          Pila.findByName(hostname)
            .then((pila) => {
              var repo = pila.related('repos').find((repo) => {
                return repo.get('slug') == value
              })

              fstream = fs.createWriteStream(repo.get('path') + '/' + filename);
              file.pipe(fstream);
              fstream.on('close', () => {
                console.log(filename + ' uploaded to: ' + repo.get('path'))

                probe(repo.get('path') + '/' + filename, (err, probeData) => {
                  var slug = ModelHelpers.getSlug(filename);

                  new Audio({
                    name: probeData.filename,
                    slug: slug,
                    path: probeData.file,
                    repo_id: repo.get('id'),
                    pila_id: pila.get('id'),
                    httpUrl: req.protocol + '://' + req.get('host') + '/audios/' + slug,
                    type: 'audio',
                    duration: probeData.format.duration
                  }).save()
                    .then((audio) => {
                      res.redirect('/audios')
                    })
                });
              });
            })
        });
      }
    });
  } else {
    res.json({message: 'Bad luck no busboy...'})
  }
}
