var express = require('express');
var routes = require('./routes');
var bodyParser = require('body-parser');
var os = require('os');
var config = require('./config');

var Pila = require('./models').pila;

var hostname = os.hostname().split('.').shift();

var app = express();
app.use(routes);


// Send Errors in JSON.
app.use(function(err, req, res, next) {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'});
})

app.listen(config.port, config.ip, () => {
  // Add pilas entry for this device if it's not there.
  var me = {
    name: hostname,
    platform: os.platform(),
    type: 'pila',
  }

  console.log('Pila:', Pila);

  Pila.findByName(hostname)
    .then((pila) => {
      if (pila == null) {
        Pila.addPila(me, function(pilas) {
          console.log('Added local Pila...');
        });
      }
    });

  console.log('Audio Pila! listening on port: ' + config.port);
});
