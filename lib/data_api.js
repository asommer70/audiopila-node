var fs = require('fs');
var probe = require('node-ffprobe');
var Datastore = require('nedb');

var db = new Datastore({ filename: './db/audiopila.db', autoload: true });
db.ensureIndex({ fieldName: 'name' }, function (err) {
  if (err) {
    console.log('error creating db index name err:', err);
  }
});
db.ensureIndex({ fieldName: 'slug' }, function (err) {
  if (err) {
    console.log('error creating db index slug err:', err);
  }
});
db.ensureIndex({ fieldName: 'type' }, function (err) {
  if (err) {
    console.log('error creating db index type err:', err);
  }
});

var DataApi = {
  findAll: function(callback) {
    db.find({}, function(err, docs) {
      console.log('docs:', docs);
      callback(docs);
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
          audio.type = 'audio'

          // TODO:as if audio is not in the database add it.
          db.find({slug: audio.slug}, function(err, docs) {
            if (err) {
              console.log('find Audio error:', err);
            }

            if (docs.length == 0) {
              db.insert(audio, (err, doc) => {
                if (err) {
                  console.log('insert audio err:', err);
                }
              });
            }
          })
          callback(audio);
        }
      });
  },

  getAudios: function(callback) {
    db.find({type: 'audio'}, (error, docs) => {
      if (error) {
        console.log('getAudios error:', error);
      }

      var audios = DataApi.makeObject(docs, 'slug')
      callback(audios);
    })
  },

  getPilas: function(callback) {
    db.find({type: 'pila'}, (error, docs) => {
      if (error) {
        console.log('getPilas error:', error);
      }

      var pilas = DataApi.makeObject(docs, 'name')
      callback(pilas);
    })
  },

  getPila: function(name, callback) {
    // Find the device by name.
    db.find({name: name, type: 'pila'}, function(error, docs) {
      if (docs.length == 0) {
        callback(null);
      } else {
        callback(docs);
      }
    })
  },

  addPila: function(pila, callback) {
    pila.type = 'pila';
    db.insert(pila, function (err, doc) {
      db.find({type: 'pila'}, function (err, docs) {
        var pilas = DataApi.makeObject(docs, 'name');
        console.log('pilas:', pilas);
        callback(pilas);
      });
    });
  },

  updatePila: (pila, callback) => {
    // db.update({ name: pila.name }, pila, {}, (err, numReplaced) => {
    //   if (err) {
    //     console.log('update err;', err);
    //     callback(null);
    //   }
    //
    //   db.find({type: 'pila'}, (err, docs) => {
    //     // Create an object from the docs Array.
    //     var pilas = DataApi.makeObject(docs, 'name');
    //     callback(pilas);
    //   });
    // });

    // db.update({ pila: pila.name }, { $inc: pila }, { upsert: true }, function (err, numReplaced, upsert) {
    db.update({ pila: pila.name }, { $set: pila }, {}, function () {

      console.log('upsert:', upsert);
        db.find({type: 'pila'}, (err, docs) => {
          // Create an object from the docs Array.
          var pilas = DataApi.makeObject(docs, 'name');
          callback(pilas);
        });
    });
  },

  makeObject: (docs, key) => {
    var obj = {};
    docs.forEach((doc) => {
      obj[doc[key]] = doc;
    })
    return obj;
  },
}

module.exports = DataApi;
