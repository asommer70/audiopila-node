var fs = require('fs');
var probe = require('node-ffprobe');

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
      this.getLocalFiles(path, (files) => {
        var repository = {name: name, path: path};
        repository.slug = name.replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

        var audioFiles = files.filter((file) => {
          var ext = file.substr(file.length - 4);
          if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
            return file;
          } else if (fs.lstatSync(path + '/' + file).isDirectory()) {
            // Add audio files in subdirectories.
            this.add(name, path + '/' + file, baseUrl, (audios) => {
              console.log('audios:', audios);
            })
          }
        })

        console.log('audioFiles.length:', audioFiles.length);


          // Use a counter to execute the res.json.
          var counter = 0;

          Pila.findByName(hostname, (pila) => {
            // If no repositories create empty object.
            if (!pila.repositories) {
              pila.repositories = {};
            }

            // If repository isn't in the repositories add it.
            if (pila.repositories[repository.slug] == undefined) {
              pila.repositories[repository.slug] = repository;
            }

            if (audioFiles.length == 0) {
              pila.audios = {};
            } else {
              audioFiles.forEach((file) => {
                this.getAudioDetails(file, path, repository, baseUrl, (audio) => {
                  pila.audios[audio.slug] = audio;
                  counter++;
                  if (counter == audioFiles.length) {
                    Pila.updatePila(pila, (pila) => {
                      console.log('Updated me with ' + audioFiles.length + ' audios...');
                    })
                    callback(pila.audios);
                  }
                });
              })
            }
          });
      });
  },

  update: function(audio, callback) {
    Pila.findByName(hostname, (pila) => {
      pila.audios[audio.slug] = audio;
      Pila.updatePila(pila, (pila) => {
        callback({message: 'Updated audio: ' + audio.slug, audio: audio});
      })
    })
  },

  getAudioDetails: function(file, path, repository, baseUrl, callback) {
      var audio = {};
      audio.slug = file.slice(0, file.length - 4).replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

      audio.repository = repository;
      audio.playbackTime = 0;

      probe(path + '/' + file, function(err, probeData) {
        if (err) {
          console.log('probe error:', error);
        } else {
          audio.name = probeData.filename;
          audio.path = probeData.file;
          audio.duration = probeData.format.duration;
          audio.type = 'audio';
          audio.httpUrl = baseUrl + '/audios/' + audio.slug;
          callback(audio);
        }
      });
  },

  getLocalFiles: function(path, callback) {
    fs.readdir(path, (error, files) => {
      if (error) {
        console.log('readir error:', error);
      } else {
        callback(files);
      }
    });
  },
}

module.exports = Audio;
