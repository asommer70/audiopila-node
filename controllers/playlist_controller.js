var Playlist = require('../models').playlist;
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

exports.playlists = function(req, res, next) {
  Playlist.all()
    .then((playlists) => {
      res.json(playlists);
    })
}
