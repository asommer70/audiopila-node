var express = require('express');
var Datastore = require('nedb');
var bodyParser = require('body-parser')
var os = require('os');
var fs = require('fs');
var busboy = require('connect-busboy');

var DataApi = require('./lib/data_api');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy({ immediate: true }));

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
      var repository = {name: req.body.name, path: req.body.path};
      repository.slug = req.body.name.replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

      var audioFiles = files.filter((file) => {
        var ext = file.substr(file.length - 4);
        if (/\.mp3|\.m4a|\.mp4|\.ogg|\.mkv|\.wav/g.exec(ext) !== null) {
          return file;
        }
      })

      // Use a counter to execute the res.json.
      var audios = {};
      var counter = 0;

      if (audioFiles.length == 0) {
        // Add Audios to local Pila.
        DataApi.getPila(os.hostname(), (pilas) => {
          if (pilas != null) {
            var pila = pilas[0];
            pila.audios = audios;

            // Add/create repositories object on the Pila.
            if (!pila.repositories) {
              pila.repositories = {};
            }
            if (pila.repositories[repository.slug] == undefined) {
              pila.repositories[repository.slug] = repository;
            }

            DataApi.updatePila(pila, (pilas) => {
              console.log('updated me with audios...');
            })
          }
        });

        res.json({message: 'Successfully added audios.', audios: audios});
      }

      audioFiles.forEach((file) => {
        DataApi.getAudio(file, req.body.path, repository, req, (audio) => {
          audios[audio.slug] = audio;
          counter++;
          if (counter == audioFiles.length) {

            // Add Audios to local Pila.
            DataApi.getPila(os.hostname(), (pilas) => {
              if (pilas != null) {
                var pila = pilas[0];
                pila.audios = audios;

                // Add/create repositories object on the Pila.
                if (!pila.repositories) {
                  pila.repositories = {};
                }
                if (pila.repositories[repository.name] == undefined) {
                  pila.repositories[repository.name] = repository;
                }

                DataApi.updatePila(pila, (pilas) => {
                  console.log('updated me with audios...');
                })
              }
            })

            res.json({message: 'Successfully added audios.', audios: audios});
          }
        });
      })
    });
});

// GET /audios/:name (download Audio from repository)
app.get('/audios/:slug', function(req, res) {
  DataApi.findAudio(req.params.slug, (audio) => {
    var stat = fs.statSync(audio.path);
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(audio.path);
    readStream.pipe(res);
  })
});

// GET /pilas (index of pilas)
app.get('/pilas', function(req, res) {
  DataApi.getPilas((pilas) => {
    res.json(pilas);
  })
});

// POST /sync (sync device and audio details)
app.post('/sync', function(req, res) {
  console.log('syncing:', req.body.name);

  // Update the local pila entry with httpUrl, lastSynced, syncedFrom, and Audios?
  var me = {
    name: os.hostname(),
    baseUrl: req.protocol + '://' + req.get('host'),
    syncUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    lastSynced: Date.now(),
    syncedFrom: req.body.name,
    type: 'pila'
  }

  DataApi.getPila(os.hostname(), (pilas) => {
    Object.assign(me, pilas[0]);
    DataApi.updatePila(me, (pilas) => {
      console.log('Updated me...');
    })
  });

  DataApi.getPila(req.body.name, (pilas) => {
    if (pilas == null) {
      DataApi.addPila(req.body, (pilas) => {
        res.json({message: 'Sync successful.', pilas: pilas, pila: pilas[me.name]});
      })
    } else {
      console.log('updating pilas...');
      DataApi.updatePila(req.body, (pilas) => {
        res.json({message: 'Sync successful.', pilas: pilas, pila: pilas[me.name]});
      })
    }
  })
});

// POST /repos/:slug (upload Audios to repository)
app.post('/repos/:slug', function(req, res) {
  if (req.busboy) {
    req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {

      if (key == 'slug') {
        req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          DataApi.getPila(os.hostname(), (pilas) => {
            var pila = pilas[0];
            var repo = pila.repositories[value];

            fstream = fs.createWriteStream(repo.path + '/' + filename);
            file.pipe(fstream);
            fstream.on('close', () => {
              console.log(filename + ' uploaded to: ' + repo.path);

              // TODO:as update Pila's audios.

              res.json({message: 'Audio uploaded to: ' + repo.path, pila: pila});
            });
          })
        });
      }
    });
  }
})

// Send Errors in JSON.
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'});
})

app.listen(3000, () => {
  // Add pilas entry for this device if it's not there.
  var me = {
    name: os.hostname(),
    platform: os.platform(),
    audios: [],
    type: 'pila',
  }

  DataApi.getPila(os.hostname(), function(pilas) {
    if (pilas == null) {
      DataApi.addPila(me, function(pilas) {
        console.log('Added local Pila...');
      });
    }
  })

  console.log('Example app listening on port 3000!');
});
