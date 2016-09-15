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

                Pila.addPila(data)
                  .then((syncPila) => {

                    // Add syncPila's repos.
                    this.addRepos(syncRepos, syncPila.get('id'), () => {
                      // Add syncPila's Audios.
                      // resolve();

                      this.addAudios(syncAudios, syncPila.get('id'), () => {
                        resolve();
                      });

                      // // Update Audios
                      // this.updateLocalAudios(syncAudios, pila, () => {
                      //   // me.audios = audios;
                      //   //
                      //   // Pila.updatePila(me, (pila) => {
                      //   //   res.json({message: 'Sync successful.', pila: pila});
                      //   // });
                      //   resolve();
                      // })
                    })
                  })
              } else {
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
    var counter = 0;
    keys.forEach((key) => {
      // Try to find the Repo, and if it's not in the local database then create it.
      Repo.findBySlug(repos[key]['slug'])
        .then((repo) => {
          if (repo === null) {
            // Remove pila attribute linking repo back to pila via pila.name.
            delete repos[key]['pila'];

            var repo = new Repo(repos[key]);

            // Link the Repo to the synced Pila.
            repo.set('pila_id', pila_id);

            repo.save()
              .then((repo) => {
                counter++
                if (counter == keys.length) {
                  callback();
                }
              });
          }
        });
    });
  },

  addAudios: function(audios, pila_id, callback) {
    var keys = Object.keys(audios);
    var counter = 0;
    keys.forEach((key) => {
      var syncAudio = audios[key];

      // Check for local Audio.
      Audio.findBySlug(syncAudio.slug)
        .then((localAudio) => {
          if (localAudio == null) {
            // Find Repo and create new Audio.
            if (syncAudio.repo) {
              Repo.findBySlug(syncAudio.repo)
                .then((repo) => {
                  delete syncAudio['repo'];
                  delete syncAudio['pila'];

                  var newAudio = new Audio(syncAudio);
                  newAudio.set('repo_id', repo.get('id'));
                  newAudio.set('pila_id', pila_id);
                  newAudio.save()
                    .then((audio) => {
                      counter++;
                      if (counter == keys.length) {
                        callback();
                      }
                    });
                });
            } else {
              counter++;
              if (counter == keys.length) {
                callback();
              }
            }
          } else {
            // Check playedTime of local Audio
            if (localAudio.get('playedTime') != undefined) {

              if (syncAudio.playedTime > localAudio.get('playedTime')) {
                localAudio.set('playbackTime', syncAudio.playbackTime);
                localAudio.set('playedTime', syncAudio.playedTime);
                localAudio.save()
                  .then((audio) => {
                    counter++
                    if (counter == keys.length) {
                      callback();
                    }
                  });
              } else {
                counter++;
                if (counter == keys.length) {
                  callback();
                }
              }
            } else {
              localAudio.set('playbackTime', syncAudio.playbackTime);
              localAudio.save()
                .then((audio) => {
                  counter++
                  if (counter == keys.length) {
                    callback();
                  }
                });
            }
          }
        });
    });
  },
}

module.exports = Sync;
