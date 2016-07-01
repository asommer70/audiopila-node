var express = require('express');
var Datastore = require('nedb');
var bodyParser = require('body-parser')
var os = require('os');

var DataApi = require('./lib/data_api');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// GET / (index of everything)
app.get('/', function(req, res) {
  DataApi.findAll((docs) => {
    res.json(docs);
  })
});

// GET /audios (index of audios)
app.get('/audios', function(req, res) {
  DataApi.getAudios((audios) => {
    res.json(audios);
  })
});

// POST /audios (add Audios in directory)
app.post('/audios', function(req, res) {
  console.log('req.body:', req.body);
    DataApi.getLocalFiles(req.body.path, (files) => {
      var parts = req.body.path.split('/');
      var repository = {name: parts[parts.length - 1], path: req.body.path};

      var audioFiles = files.filter((file) => {
        var ext = file.substr(file.length - 4);
        if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
          return file;
        }
      })

      // Use a counter to execute the res.json.
      var audios = {};
      var counter = 0;

      audioFiles.forEach((file) => {
        DataApi.getAudio(file, req.body.path, repository, (audio) => {
          audios[audio.slug] = audio;
          counter++;
          if (counter == audioFiles.length) {
            res.json({message: 'Successfully added audios.', audios: audios});
          }
        });
      })
    });
})

// GET /pilas (index of pilas)
app.get('/pilas', function(req, res) {
  DataApi.getPilas((pilas) => {
    res.json(pilas);
  })
});

// POST /sync (sync device and audio details)
app.post('/sync', function(req, res) {
  console.log('syncing:', req.body.name);

  var me = {
    name: os.hostname(),
    platform: os.platform(),
    audios: [],
    lastPlayed: undefined,
    lastSynced: Date.now(),
    syncedFrom: req.body.name,
    httpUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    type: 'pila'
  }

  DataApi.getPila(req.body.name, (pilas) => {
    if (pilas == null) {
      DataApi.addPila(req.body, (pilas) => {
        res.json({message: 'Sync successful.', pilas: docs});
      })
    } else {
      DataApi.updatePila(req.body, me, (pilas) => {
        res.json({message: 'Sync successful.', pilas: pilas, pila: pilas[req.body.name]});
      })
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
