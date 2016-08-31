'use strict';

var fs = require('fs');
var path = require('path');
var probe = require('node-ffprobe');

var Pila = require('../models').pila;
console.log('audio_file Pila:', Pila);

var hostname = require('os').hostname().split('.').shift();

module.exports = {
  add: function(name, path, baseUrl) {
    return new Promise(function (resolve, reject) {

      // Get the local Pila and associate the new Audios and/or Repo with it.
      Pila.findByName(hostname)
        .then((pila) => {
          // TODO:as associate has many repositories to one pila.

          // TODO:as determine if Repo is already in the system and if not create it.

          return pila;
        })
        .then((pila) => {
          console.log('2nd then() pila:', pila);
        })

      var repository = {name: name, path: path};
      repository.slug = name.replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();
      console.log('respository:', respository);
    });



    // this.getLocalFiles(path, (err, files) => {
    //   if (err) throw err;
    //
    //   Pila.findByName(hostname, (pila) => {
    //     // If no repositories create empty object.
    //     if (!pila.repositories) {
    //       pila.repositories = {};
    //     }
    //
    //     // If repository isn't in the repositories add it.
    //     if (pila.repositories[repository.slug] == undefined) {
    //       pila.repositories[repository.slug] = repository;
    //     }
    //
    //     if (files.length == 0) {
    //       pila.audios = {};
    //     } else {
    //       console.log('files.length:', files.length);
    //       var i, j, tempFiles, chunk = 200;
    //       for (i=0, j = files.length; i < j; i += chunk) {
    //         tempFiles = files.slice(i, i + chunk);
    //         //console.log(tempFiles);
    //
    //         // Use a counter to execute the res.json.
    //         var counter = 0;
    //         tempFiles.forEach((file) => {
    //           this.getAudioDetails(file, repository, baseUrl, (audio) => {
    //             console.log('audio.slug:', audio.slug);
    //             pila.audios[audio.slug] = audio;
    //             counter++;
    //             if (counter == tempFiles.length) {
    //               Pila.updatePila(pila, (pila) => {
    //                 console.log('Updated me with ' + tempFiles.length + ' audios...');
    //               })
    //               callback(pila.audios);
    //             }
    //           });
    //         })
    //       }
    //     }
    //   });
    // });
  },

  getAudioDetails: function(file, repository, baseUrl, callback) {
      var audio = {};
      var parts = file.split('/');
      var filename = parts[parts.length - 1];

      audio.slug = filename.slice(0, file.length - 4).replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

      audio.repository = repository;
      audio.playbackTime = 0;

        console.log('probing file:', file);
        probe(file, function(err, probeData) {
          if (err) {
            console.log('probe err:', err);
            audio.name = filename;
            audio.path = file;
            audio.duration = 0;
            audio.type = 'audio';
            audio.httpUrl = baseUrl + '/audios/' + audio.slug;
            callback(audio);
          } else {
            audio.name = probeData.filename;
            audio.path = probeData.file;
            if (probeData.format) {
              audio.duration = probeData.format.duration;
            } else {
              audio.duration = 0;
            }
            audio.type = 'audio';
            audio.httpUrl = baseUrl + '/audios/' + audio.slug;
            callback(audio);
          }
        });
  },

  getLocalFiles: function(dir, done) {
    var results = [];
    fs.readdir(dir, (err, list) => {
      if (err) return done(err);

      var pending = list.length;
      if (!pending) return done(null, results);

      list.forEach((file) => {
        file = path.resolve(dir, file);

        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            this.getLocalFiles(file, (err, res) => {

              results = results.concat(res);

              if (!--pending) done(null, results);
            });
          } else {
            var ext = file.substr(file.length - 4);
            if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
              // return path + '/' + file;
              results.push(file);
            }
            if (!--pending) done(null, results);
          }
        });
      });
    });
  },

}
