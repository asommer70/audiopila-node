var Playlist = require('../models').playlist;
var Pila = require('../models').pila;
var Audio = require('../models').audio;
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

exports.playlists = function(req, res, next) {
  Playlist.all()
    .then((playlists) => {
      res.json(playlists);
    })
}

exports.playlist = function(req, res, next) {
  Playlist.findBySlug(req.params.slug)
    .then((playlist) => {
      res.json(playlist);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

exports.add = function(req, res, next) {
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

exports.changeAudio = function(req, res, next) {
  Playlist.findBySlug(req.body.playlist)
    .then((playlist) => {
      Audio.findBySlug(req.body.audio)
        .then((audio) => {
          if (req.method == 'POST') {
            audio.playlists().attach([playlist])
              .then((collection) => {
                res.redirect('/playlists/' + req.body.playlist);
              })
              .catch((error) => {
                res.status(501).json(error);
              });
          } else if (req.method == 'DELETE') {
            // playlist.audios().remove([audio])
            audio.playlists().detach(playlist)
              .then((collection) => {
                res.redirect('/playlists/' + req.body.playlist);
              })
              .catch((error) => {
                res.status(501).json(error);
              });

          }
        })
        .catch((error) => {
          res.status(404).json(error);
        });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
}

exports.delete = function(req, res, next) {
  Playlist.findBySlug(req.params.slug)
    .then((playlist) => {
      playlist.destroy()
        .then((playlist) => {
          res.redirect('/playlists');
        })
    })
    .catch((error) => {
      res.status(501).json(error);
    })
}
