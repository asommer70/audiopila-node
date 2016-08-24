var fs = require('fs');
var path = require('path');

var dirPath = '/home/adam/Music';

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function(file) {
      file = path.resolve(dir, file);

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {

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
};

walk(dirPath, function(err, results) {
  if (err) throw err;
  console.log(results);
});

//function getLocalFiles(path, callback) {
//  fs.readdir(path, (error, files) => {
//    if (error) {
//      console.log('readir error:', error);
//    } else {
//      callback(files);
//    }
//  });
//}
//
//
//function getAudioFiles(path, callback) {
//  getLocalFiles(path, (files) => {
//    //console.log('files:', files);
//    var audioFiles = files.filter((file) => {
//      var ext = file.substr(file.length - 4);
//      if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
//         return path + '/' + file;
//      }
//  
//      if (fs.lstatSync(path + '/' + file).isDirectory()) {
//        getLocalFiles(path + '/' + file, (files) => {
//          //console.log('files:', files);
//          //audioFiles.concat(files);
//          callback(files);
//        });
//      }
//    })
//  });
//}
//
//getAudioFiles(path, (audios) => {
//  console.log('audios:', audios);
//});
            //if (fs.lstatSync(path + '/' + file).isDirectory()) {
            //  // Add audio files in subdirectories.
            //  console.log('name:', name, 'path:', path + '/' + file);
            //  this.getLocalFiles(path + '/' + file, (files) => {
            //    var subAudioFiles = files.filter((file) => {
            //      var ext = file.substr(file.length - 4);
            //      if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
            //        return file;
            //      } 
            //    })
            //    audioFiles.concat(subAudioFiles);
            //  })
            //  //this.add(name, path + '/' + file, baseUrl, (audios) => {
            //  //  console.log('audios:', audios);
            //  //})
            //}
