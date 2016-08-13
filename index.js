var express = require('express');
var routes = require('./routes');
var bodyParser = require('body-parser');
var Datastore = require('nedb');
var os = require('os');
var fs = require('fs');
// var busboy = require('connect-busboy');
var request = require('request');

var DataApi = require('./lib/data_api');
var PlayerApi = require('./lib/player_api');

var hostname = require('os').hostname().split('.').shift();
// var player = new Player();
var player = {};

var app = express();
app.use(routes);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(busboy({ immediate: true }));


// Send Errors in JSON.
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'});
})

var port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  // Add pilas entry for this device if it's not there.
  var me = {
    name: hostname,
    platform: os.platform(),
    audios: {},
    type: 'pila',
  }

  DataApi.getPila(hostname, function(pilas) {
    if (pilas == null) {
      DataApi.addPila(me, function(pilas) {
        console.log('Added local Pila...');
      });
    }
  })

  console.log('Audio Pila! listening on port 3000!');
});
