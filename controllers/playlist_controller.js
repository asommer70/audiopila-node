var Playlist = require('../models').playlist;
var Pila = require('../models').pila;
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

exports.playlists = function(req, res, next) {
  Playlist.all()
    .then((playlists) => {
      res.json(playlists);
    })
}

exports.playlist = function(req, res, next) {
  console.log('GETting playlist...');
  Playlist.findBySlug(req.params.slug)
    .then((playlist) => {
      res.json(playlist);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

exports.add = function(req, res, next) {
  console.log('adding Playlist...');
  Pila.findByName(hostname)
    .then((pila) => {
      Playlist.add(req.body.name, pila.get('id'))
        .then((playlist) => {
          res.json(playlist);
        })
        .catch((error) => {
          res.status(501).json(error);
        });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

exports.addAudio = function(res, req, next) {
  console.log('req.body:', req.body);
  var plSlug = req.body.playlist;
  var aSlug = req.body.audio;
  console.log('plSlug:', plSlug, 'aSlug:', aSlug);
  // Playlist.findBySlug(plSlug)
  //   .then((playlist) => {
  //     Audio.findBySlug(aSlug)
  //     .then((audio) => {
  //       audio.playlists().attach([playlist])
  //         .then((collection) => {
  //           res.json(playlist);
  //         })
  //         .catch((error) => {
  //           res.status(501).json(error);
  //         });
  //     })
  //     .catch((error) => {
  //       res.status(404).json(error);
  //     });
  //   })
  //   .catch((error) => {
  //     res.status(404).json(error);
  //   });
}
