var Pila = require('../models').pila;
var Repo = require('../models').repo;
var Audio = require('../models').audio;
var Player = require('../models/player');
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

var Sync = {
  now: function (data, urls) {
    return new Promise((resolve, reject) => {
      // Update the local pila entry with httpUrl, lastSynced, syncedFrom, and Audios?
      Pila.findByName(hostname)
        .then((pila) => {
          // Update local Pila.
          pila.set('baseUrl', urls[0]);
          pila.set('syncUrl', urls[0] + urls[1]);
          pila.set('syncedFrom', data.name);
          pila.set('lastSynced', Date.now());
          pila.save()

          // Try and find and update the new Pila, or if it's not there add it.
          Pila.findByName(data.name)
            .then((syncPila) => {
              if (syncPila == null) {
                // Save repos and audios for later processing.
                var syncRepos = data.repos;
                var syncAudios = data.audios;
                delete data['repos'];
                delete data['audios'];

                Pila.addPila(data)
                  .then((syncPila) => {
                    // console.log('pila.audios:', pila.related('audios'));

                    // Add syncPila's repos.
                    this.addRepos(syncRepos, pila.get('id'), () => {
                      // Add syncPila's Audios.

                      // Update Audios
                      this.updateLocalAudios(syncAudios, pila, () => {
                        // me.audios = audios;
                        //
                        // Pila.updatePila(me, (pila) => {
                        //   res.json({message: 'Sync successful.', pila: pila});
                        // });
                        resolve();
                      })
                    })
                  })
              } else {
                console.log('BALLS updating pilas... syncPila.name:', syncPila.get('name'));

                // // Update synced Pila.
                // Pila.updatePila(data, (pila) => {
                //   this.updateLocalAudios(pila.audios, me.audios, (audios) => {
                //     me.audios = audios;
                //
                //     Pila.updatePila(me, (pila) => {
                //       res.json({message: 'Sync successful.', pila: pila});
                //     });
                //   });
                // });
              }
            });
        }); // end Pila.findByName(hostname)
    }); // end Promise
  },

  addRepos: function(repos, pila_id, callback) {
    var keys = Object.keys(repos);
    var counter = keys.length;
    keys.forEach((key) => {
      var repo = new Repo(repos[key]);
      repo.set('pila_id', pila_id);
      repo.save()
        .then((repo) => {
          counter++
          if (counter == keys.length) {
            callback();
          }
        })
    })
  },

  updateLocalAudios: function(remoteAudios, pila, callback) {
    for (var key in remoteAudios) {
      var remoteAudio = remoteAudios[key];
      // var localAudio = localAudios[key];
      var localAudio = pila.related('audios').find((audio) => {
        if (audio.get('slug') == remoteAudio.slug) {
          return audio
        }
      })

      // console.log('remoteAudio:', remoteAudio, 'localAudio:', localAudio);

      if (localAudio != undefined) {
        if (localAudio.playedTime != undefined) {
          if (remoteAudio.playedTime > localAudio.playedTime) {
            // localAudios[key].playbackTime = remoteAudio.playbackTime;
            localAudio.set('playbackTime', remoteAudio.playbackTime);
            localAudio.save()
              .then((audio) => {
                callback();
              })
          }
        } else {
          // localAudios[key].playbackTime = remoteAudio.playbackTime;
          localAudio.set('playbackTime', remoteAudio.playbackTime);
          localAudio.save()
            .then((audio) => {
              callback();
            })
        }
      }
    }
    // callback(localAudios);
  },
}

module.exports = Sync;
