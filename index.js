var express = require('express');
var Datastore = require('nedb');
var bodyParser = require('body-parser')
var os = require('os');

var PilaApi = require('./lib/pila_api');

var db = new Datastore({ filename: 'db/audiopila.db', autoload: true });
db.ensureIndex({ fieldName: 'name' }, function (err) {
  if (err) {
    console.log('error creating db index name err:', err);
  }
});


var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// GET / (index of devices)
app.get('/', function(req, res) {
  db.find({}, function (err, docs) {
    console.log('docs:', docs);
    res.json({pilas: docs});
  });
});

// POST /audios (add Audios in directory)
app.post('/audios', function(req, res) {
  console.log('req.body:', req.body);
    PilaApi.getLocalFiles(req.body.path, (files) => {
      var parts = req.body.path.split('/');
      var repository = {name: parts[parts.length - 1], path: req.body.path};

      var audioFiles = files.filter((file) => {
        var ext = file.substr(file.length - 4);
        if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
          return file;
        }
      })

      PilaApi.getAudios(audioFiles, req.body.path, repository, (audios) => {
        db.insert({audios: audios}, function(error, doc) {
          if (error) {
            console.log('audios db.insert error:', error);
          }
          res.json({message: 'Successfully added audios.', audios: audios});
        })
      });
    });
})

// POST /sync (sync device and audio details)
app.post('/sync', function(req, res) {
  console.log('syncing:', req.body.name);

  var pila = {
    name: os.hostname(),
    platform: os.platform(),
    audios: [],
    lastPlayed: undefined,
    lastSynced: Date.now(),
    syncedFrom: req.body.name,
    httpUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  }

  // Find the device by name.
  db.find({name: req.body.name}, function(error, docs) {
    if (docs.length == 0) {
      db.insert(req.body, function (err, doc) {
        db.find({}, function (err, docs) {
          res.json({message: 'Sync successful.', pilas: docs});
        });
      });
    } else {
      // console.log('docs:', docs);
      db.update({ name: req.body.name }, req.body, {}, function (err, numReplaced) {
        if (err) {
          console.log('update err;', err);
        }

        db.find({}, function (err, docs) {
          // Add this app to the list.
          docs[docs.length] = pila;

          // Create an object from the docs Array.
          var pilas = {};
          docs.forEach((doc) => {
            pilas[doc.name] = doc;
          })

          res.json({message: 'Sync successful.', pilas: pilas, pila: pila});
        });
      });
    }
  })
});

// Send Errors in JSON.
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'});
})

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
