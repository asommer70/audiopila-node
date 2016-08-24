var fs = require('fs');
var path = require('path');
var probe = require('node-ffprobe');
var Worker = require('webworker-threads').Worker;

var db = require('./db');
var Pila = require('./pila');

var hostname = require('os').hostname().split('.').shift();

var Audio = {
  all: function(callback) {
    Pila.findByName(hostname, (pila) => {
      callback(pila.audios);
    })
  },

  findBySlug: function(slug, callback) {
    Pila.findByName(hostname, (pila) => {
      callback(pila.audios[slug]);
    })
  },

  delete: function(slug, callback) {
    Pila.findByName(hostname, (pila) => {
      var audio = pila.audios[slug];
      console.log('Audio.delete audio.name:', audio.name, 'from:', audio.path);

      // Actually remove file.
      fs.unlink(audio.path);

      // Update pila.audios.
      delete pila.audios[slug];
      Pila.updatePila(pila, (pila) => {
        // Return result.
        callback({message: 'Audio successfully deleted.', audios: pila.audios});
      })
    })
  },

  add: function(name, path, baseUrl, callback) {
      //this.getLocalFiles(path, (files) => {

      //  var audioFiles = files.filter((file) => {
      //    var ext = file.substr(file.length - 4);
      //    if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
      //      return file;
      //    } 
      //  })

      //  for (var i = 0; files.length; i++) {
      //    var file = files[i];
      //    if (file !== undefined) {
      //      if (fs.lstatSync(path + '/' + file).isDirectory()) {
      //        // Add audio files in subdirectories.
      //        console.log('name:', name, 'path:', path + '/' + file);
      //        this.getLocalFiles(path + '/' + file, (files) => {
      //          var subAudioFiles = files.filter((file) => {
      //            var ext = file.substr(file.length - 4);
      //            if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
      //              return file;
      //            } 
      //          })
      //          audioFiles.concat(subAudioFiles);
      //        })
      //        //this.add(name, path + '/' + file, baseUrl, (audios) => {
      //        //  console.log('audios:', audios);
      //        //})
      //      }
      //    }
      //  }

        //console.log('audioFiles.length:', audioFiles.length);
        
      var repository = {name: name, path: path};
      repository.slug = name.replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();
        
      this.getLocalFiles(path, (err, files) => {
        if (err) throw err;

          Pila.findByName(hostname, (pila) => {
            // If no repositories create empty object.
            if (!pila.repositories) {
              pila.repositories = {};
            }

            // If repository isn't in the repositories add it.
            if (pila.repositories[repository.slug] == undefined) {
              pila.repositories[repository.slug] = repository;
            }

            if (files.length == 0) {
              pila.audios = {};
            } else {
              console.log('files.length:', files.length);
              var i, j, tempFiles, chunk = 200;
              for (i=0, j = files.length; i < j; i += chunk) {
                tempFiles = files.slice(i, i + chunk);
                //console.log(tempFiles);

          // Use a counter to execute the res.json.
          var counter = 0;
          var worker = new Worker(() => {
              tempFiles.forEach((file) => {
                this.getAudioDetails(file, repository, baseUrl, (audio) => {
                  console.log('audio.slug:', audio.slug);
                  pila.audios[audio.slug] = audio;
                  counter++;
                  if (counter == tempFilesfiles.length) {
                    Pila.updatePila(pila, (pila) => {
                      console.log('Updated me with ' + tempFiles.length + ' audios...');
                    })
                    //callback(pila.audios);
                    this.close();
                  }
                });
              })
          });
              }

              //files.forEach((file) => {
                //this.getAudioDetails(file, repository, baseUrl, (audio) => {
                //  pila.audios[audio.slug] = audio;
                //  counter++;
                //  if (counter == files.length) {
                //    Pila.updatePila(pila, (pila) => {
                //      console.log('Updated me with ' + files.length + ' audios...');
                //    })
                //    callback(pila.audios);
                //  }
                //});
              //})
            }
          });
      });


      //});
  },

  update: function(audio, callback) {
    Pila.findByName(hostname, (pila) => {
      pila.audios[audio.slug] = audio;
      Pila.updatePila(pila, (pila) => {
        callback({message: 'Updated audio: ' + audio.slug, audio: audio});
      })
    })
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

  oldgetLocalFiles: function(path, callback) {
    fs.readdir(path, (error, files) => {
      if (error) {
        console.log('readir error:', error);
      } else {
        callback(files);
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

module.exports = Audio;
