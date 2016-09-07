'use strict';

var fs = require('fs');
var path = require('path');
var probe = require('node-ffprobe');

var Pila = require('../models').pila;
var Repo = require('../models').repo;
var Audio = require('../models').audio;
var ModelHelpers = require('./model_helpers');

var hostname = require('os').hostname().split('.').shift();

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
                resolve({audios: audios});
              })
            });
          } else {
            // Create audios.
            this.getAudios(pila, currRepo, (audios) => {
              resolve({audios: audios});
            })
          }

        })
    });
  },

  getAudios: function(pila, repo, callback) {
    console.log('repo.path:', repo.get('path'));

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
          this.getAudioDetails(file, pila, repo, (audio) => {
            audios[audio.get('slug')] = audio;
            fileCount++;

            if (fileCount == files.length) {
              callback(audios);
            }
          })
        });
      }
    })
  },

  getAudioDetails: function(file, pila, repo, callback) {
      var audio = {};
      var parts = file.split('/');
      var filename = parts[parts.length - 1];

      audio.slug = ModelHelpers.getSlug(filename);

      audio.pila_id = pila.get('id');
      audio.repo_id = repo.get('id');
      audio.playbackTime = 0;

      console.log('probing file:', file);
      probe(file, (err, probeData) => {
        if (err) {
          console.log('probe err:', err);
          audio.name = filename;
          audio.path = file;
          audio.duration = 0;
          audio.type = 'audio';
          audio.httpUrl = this.baseUrl + '/audios/' + audio.slug;
          new Audio(audio).save()
            .then((audio) => {
              callback(audio);
            })
            .catch((error) => {
              console.log('error:', error.detail);

              if (error.constraint == 'audios_path_unique') {
                Audio.findBySlug(audio.slug)
                  .then((audio) => {
                    callback(audio);
                  })
              }
            })
        } else {
          audio.name = probeData.filename;
          audio.path = probeData.file;
          if (probeData.format) {
            audio.duration = probeData.format.duration;
          } else {
            audio.duration = 0;
          }
          audio.type = 'audio';
          audio.httpUrl = this.baseUrl + '/audios/' + audio.slug;
          new Audio(audio).save()
            .then((audio) => {
              callback(audio);
            })
            .catch((error) => {
              console.log('error:', error.detail);

              if (error.constraint == 'audios_path_unique') {
                Audio.findBySlug(audio.slug)
                  .then((audio) => {
                    callback(audio);
                  })
              }
            })
        }
      });
  },

  getLocalFiles: function(dir, callback) {
    var results = [];
    fs.readdir(dir, (err, list) => {
      if (err) return callback(err);

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
      slug: ModelHelpers.getSlug(name)
    })
    .save()
    .then((repo) => {
      // console.log('createRepo .then repo:', repo);
      callback(repo);
    })
  },
}
