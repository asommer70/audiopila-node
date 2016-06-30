var fs = require('fs');
var probe = require('node-ffprobe');

var PilaApi = {
  getLocalFiles: function(path, callback) {
    fs.readdir(path, (error, files) => {
      if (error) {
        console.log('readir error:', error);
      } else {
        callback(files);
      }
    });
  },

  getAudio: function(file, path, repository, callback) {
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

          callback(audio);
        }
      });
  },

  getAudios: function(files, path, repository, callback) {
    var audios = {};

    // Use a counter to execute the callback.
    var counter = 0;

    files.forEach((file) => {
      this.getAudio(file, path, repository, (audio) => {
        audios[audio.slug] = audio;
        counter++;
        if (counter == files.length) {
          callback(audios);
        }
      })
    }); // end forEach
  },
}

module.exports = PilaApi;
