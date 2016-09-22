'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawnSync;

var Pila = require('../models').pila;
var Repo = require('../models').repo;
var Audio = require('../models').audio;
var Playlist = require('../models').playlist;
var ModelHelpers = require('./model_helpers');

var hostname = ModelHelpers.hostname;

module.exports = {
  baseUrl: undefined,

  add: function(name, path, baseUrl) {
    this.baseUrl = baseUrl;

    return new Promise((resolve, reject) => {

      // Get the local Pila and associate the new Audios and/or Repo with it.
      return Pila.findByName(hostname)
        .then((pila) => {

          // Find the Repo.
          var currRepo = pila.related('repos').find((repo) => {
            return repo.get('name') == name
          })
          if (currRepo == undefined) {
            this.createRepo(pila, name, path, (repo) => {
              // Create audios.
              this.getAudios(pila, repo, (audios) => {
                resolve(audios);
              })
            });
          } else {
            // Create audios.
            this.getAudios(pila, currRepo, (audios) => {
              resolve(audios);
            })
          }

        })
    });
  },

  getAudios: function(pila, repo, callback) {
    // Get files in repo path.
    this.getLocalFiles(repo.get('path'), (error, files) => {

      if (error) {
        console.log('error:', error.message);
        callback(error);
      }

      if (files.length === 0) {
        console.log('Emtpy directory at: ' + repo.get('path'));
        pila.audios = {};
      } else {
        var audios = {};
        var fileCount = 0;

        files.forEach((file) => {
          // Check for subdirectory and create Playlist if there isn't one.
          console.log('file:', file);
          this.checkPlaylist(repo, file, (playlist) => {
            // Create Audios.
            this.createAudio(file, pila, repo, playlist, (audio) => {
              audios[audio.get('slug')] = audio;
              console.log('file.forEach audio.slug:', audio.get('slug'))
              fileCount++;

              console.log('fileCount:', fileCount);
              if (fileCount == files.length) {
                callback(audios);
              }
            })

          })
        });
      }
    })
  },

  checkPlaylist: function(repo, file, callback) {
    console.log('checkPlaylist file:', file);
    // Determine if a Playlist is needed.
    var fileParts = file.split('/');
    var repoParts = repo.get('path').split('/');
    var name = fileParts[repoParts.length];
    var slug = fileParts[repoParts.length];

    // console.log('checkPlaylist... file:', file, 'repo.path:', repo.get('path'));

    Playlist.findBySlug(slug)
      .then((playlist) => {
        console.log('playlist found... playlist.slug:', playlist);

        if (playlist) {
          callback(playlist);
        } else {
          if (fileParts.length > repoParts.length + 1) {
            new Playlist({
              name: name,
              slug: ModelHelpers.getSlug(name),
              pila_id: repo.get('pila_id')
            }).save()
              .then((playlist) => {
                callback(playlist);
              })
              .catch((error) => {
                // 2305 == constraint violation.
                if (error.code != 23505) {
                  console.log('error:', error);
                } else {
                  Playlist.findBySlug(slug)
                    .then((playlist) => {
                      console.log('playlist.save other error:', error.code, 'playlist.slug:', playlist.get('slug'));

                      callback(playlist);
                    });
                }
              })
          } else {
            callback(null);
          }
        }
      })
  },

  createAudio: function(file, pila, repo, playlist, callback) {
    var audio = {};
    var parts = file.split('/');
    var filename = parts[parts.length - 1];

    audio.slug = ModelHelpers.getSlug(filename);

    audio.pila_id = pila.get('id');
    audio.repo_id = repo.get('id');
    audio.playbackTime = 0;

    audio.name = filename;
    audio.path = file;
    audio.type = 'audio';
    audio.httpUrl = this.baseUrl + '/audios/' + audio.slug;
    var fileDeets = this.getAudioDetails(file);
    if (fileDeets) {
      audio.duration = parseFloat(fileDeets.format.duration);
    }

    var newAudio = new Audio(audio);

    newAudio.save()
      .then((audio) => {
        if (playlist) {
          audio.playlists().attach([playlist])
            .then((attachedAudio) => {
              callback(attachedAudio);
            })
        } else {
          callback(audio);
        }
      })
      .catch((error) => {
        if (error.constraint == 'audios_path_unique') {
          Audio.findBySlug(audio.slug)
            .then((audio) => {
              if (playlist) {
                audio.playlists().attach([playlist]);
              }

              callback(audio);
            })
        } else {
          console.log('newAudio.save error:', error);
          callback(audio);
        }
      })
  },

  getAudioDetails: function(file) {
    var proc = spawn('ffprobe', ['-show_streams', '-show_format', '-of', 'json', '-loglevel', 'error', file], { encoding : 'utf8' });
    if (proc.stderr) {
      console.log('proc.stderr:', proc.stderr);
      return null;
    } else {
      return JSON.parse(proc.stdout);
    }
  },

  getLocalFiles: function(dir, callback) {
    var results = [];
    fs.readdir(dir, (err, list) => {
      if (err) {
        callback(err, null);
      }

      var pending = list.length;
      if (!pending) return callback(null, results);

      list.forEach((file) => {
        file = path.resolve(dir, file);

        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            this.getLocalFiles(file, (err, res) => {

              results = results.concat(res);

              if (!--pending) callback(null, results);
            });
          } else {
            var ext = file.substr(file.length - 4);
            if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav|\.mkv/g.exec(ext) !== null) {
              results.push(file);
            }
            if (!--pending) callback(null, results);
          }
        });
      });
    });
  },

  createRepo: function(pila, name, path, callback) {
    new Repo({
      name: name,
      path: path,
      pila_id: pila.get('id'),
      slug: ModelHelpers.getSlug(name),
      type: 'repo'
    })
    .save()
    .then((repo) => {
      callback(repo);
    })
  },
}
