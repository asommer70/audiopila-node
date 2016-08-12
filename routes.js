var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var router = express.Router();

var PilaController = require('./controllers/pila_controller');
var DataApi = require('./lib/data_api');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var hostname = require('os').hostname().split('.').shift();


// GET / (index of everything)
router.get('/', PilaController.pilas);

// GET /pilas (index of pilas)
router.get('/pilas', PilaController.pilas);

// GET /pilas/:name (get individual pila)
router.get('/pilas/:name', PilaController.pila);

// GET /audios (index of audios)
router.get('/audios', function(req, res) {
  DataApi.getAudios((audios) => {
    res.json(audios);
  })
});

// GET /audios/:slug (download Audio from repository)
router.get('/audios/:slug', function(req, res) {
  console.log('req.params.slug:', req.params.slug);
  DataApi.findAudio(req.params.slug, (audio) => {
    var stat = fs.statSync(audio.path);
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(audio.path);
    res.audio = audio;
    readStream.pipe(res);
  })
});


// POST /audios (add Audios in directory)
router.post('/audios', function(req, res) {
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

      console.log('audioFiles.length:', audioFiles.length);

      // Use a counter to execute the res.json.
      var counter = 0;

      DataApi.getPila(hostname, (pilas) => {
        var pila = pilas[0];
        // var audios = pila.audios;

        if (audioFiles.length == 0) {
          // Add Audios to local Pila.
          if (pilas != null) {
            pila.audios = {};

            // Add/create repositories object on the Pila.
            if (!pila.repositories) {
              pila.repositories = {};
            }
            if (pila.repositories[repository.slug] == undefined) {
              pila.repositories[repository.slug] = repository;
            }
            if (!pila.audios) {
              pila.audios = {};
            }

            DataApi.updatePila(pila, (pilas) => {
              console.log('updated me with audios...');
            })
          }
        } else {
          if (!pila.repositories) {
            pila.repositories = {};
          }
          if (pila.repositories[repository.slug] == undefined) {
            pila.repositories[repository.slug] = repository;
          }
          if (!pila.audios) {
            pila.audios = {};
          }

          audioFiles.forEach((file) => {
            DataApi.getAudio(file, req.body.path, repository, req, (audio) => {
              pila.audios[audio.slug] = audio;
              counter++;
              if (counter == audioFiles.length) {
                DataApi.updatePila(pila, (pilas) => {
                  console.log('Updated me with ' + audioFiles.length + ' audios...');
                })
                res.json({message: 'Successfully added audios.', audios: pila.audios});
              }
            });
          })
        }
      });
    });
});

// POST /sync (sync device and audio details)
router.post('/sync', function(req, res) {
  console.log('syncing:', req.body.name);

  // Update the local pila entry with httpUrl, lastSynced, syncedFrom, and Audios?
  var me = {
    name: hostname,
    baseUrl: req.protocol + '://' + req.get('host'),
    syncUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    syncedFrom: req.body.name,
  }

  // Get Me
  DataApi.getPila(hostname, (pilas) => {
    // console.log('pilas[0].audios:', pilas[0].audios);
    // Object.assign(pilas[0], me);
    for (var attrname in pilas[0]) { me[attrname] = pilas[0][attrname]; }
    me.lastSynced = Date.now();

    // Update Me
    DataApi.updatePila(me, (pilas) => {
      console.log('Updated me...');

      DataApi.getPila(req.body.name, (pilas) => {
        if (pilas == null) {
          DataApi.addPila(req.body, (pilas) => {
            // Update Audios
            DataApi.updateAudiosSync(pilas[req.body.name].audios, pilas[me.name].audios, (audios) => {
              me.audios = audios;

              DataApi.updatePila(me, (pilas) => {
                res.json({message: 'Sync successful.', pilas: pilas, pila: pilas[me.name]});
              })
            })
          })
        } else {
          console.log('updating pilas...');

          // Update synced Pila.
          DataApi.updatePila(req.body, (pilas) => {
            DataApi.updateAudiosSync(pilas[req.body.name].audios, pilas[me.name].audios, (audios) => {
              me.audios = audios;

              DataApi.updatePila(me, (pilas) => {
                res.json({message: 'Sync successful.', pilas: pilas, pila: pilas[me.name]});
              })
            })
          })
        }
      })
    })
  });
});

// POST /repos/:slug (upload Audios to repository)
router.post('/repos/:slug', function(req, res) {
  if (req.busboy) {
    req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {

      if (key == 'slug') {
        req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          DataApi.getPila(hostname, (pilas) => {
            if (pilas) {
              var pila = pilas[0];
              var repo = pila.repositories[value];

              fstream = fs.createWriteStream(repo.path + '/' + filename);
              file.pipe(fstream);
              fstream.on('close', () => {
                console.log(filename + ' uploaded to: ' + repo.path);

                // Send a POST to /audios to updated the local repo's Audios list.
                var options = {
                  uri: req.protocol + '://' + req.get('host') + '/audios/',
                  method: 'POST',
                  json: repo
                };
                request(options, (error, response, body) => {});

                res.json({message: 'Audio uploaded to: ' + repo.path, pila: pila});
              });
            } else {
              res.json({message: 'Audio could not be uploaded.'});
            }
          })
        });
      }
    });
  }
})


// PUT /audios/:slug (play Audio)
router.put('/audios/:slug', function(req, res) {
  switch (req.body.action) {
    case 'play':
    console.log('playing...');
      PlayerApi.play(req.params.slug, (data) => {
        res.json(data);
      })
      break;

    case 'pause':
      console.log('pausing...');
      PlayerApi.pause(req.params.slug, (data) => {
        if (data.hasOwnProperty('audio')) {
          data.audio.playedTime = Date.now();

          DataApi.updateAudio(data.audio, (audio) => {
            res.json(data);
          })
        } else {
          res.json(data);
        }
      })
      break;

    case 'forward':
      console.log('going forward...');
      PlayerApi.seek(req.params.slug, 'forward', (data) => {
        res.json(data);
      })
      break;
    case 'backward':
      console.log('going backward...');
      PlayerApi.seek(req.params.slug, 'backward', (data) => {
        res.json(data);
      })
      break;
  }
})


// DELETE /pilas/:name (remove pila)
router.delete('/pilas/:name', PilaController.deletePila)


module.exports = router;
