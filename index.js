var express = require('express');
var Datastore = require('nedb');
var bodyParser = require('body-parser')
var os = require('os');

var db = new Datastore({ filename: 'db/audiopila.db', autoload: true });

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

// POST /sync (sync device and audio details)
app.post('/sync', function(req, res) {
  console.log('syncing:', req.body.name);

  var pila = {
    name: os.hostname(),
    platform: os.platform(),
    audios: [],
    lastPlayed: undefined,
    lastSynced: Date.now(),
    syncedFrom: req.body.name
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
          res.json({message: 'Sync successful.', pilas: docs, pila: pila});
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