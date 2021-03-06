var bookshelf = require('./db');
var Pila = require('./pila');
var Audio = require('./audio');
var ModelHelpers = require('../../lib/model_helpers');

var Playlist = bookshelf.Model.extend({
  tableName: 'playlists',
  pila: function() {
    return this.belongsTo('Pila');
  },
  audios: function() {
    return this.belongsToMany('Audio');
  },
  hasTimestamps: true
}, {
  add: function(name, pila_id) {
    return new Playlist({name: name, slug: ModelHelpers.getSlug(name), pila_id: pila_id}).save();
  },
  all: function() {
    return this.fetchAll()
      .then((playlists) => {
        return this.makeObject(playlists, 'id');
      });
  },
  findBySlug: function(slug) {
    return this.where('slug', slug).fetch({withRelated: ['pila', 'audios']});
  },
  dependents: ['audios'],
  makeObject: ModelHelpers.makeObject
});

module.exports = bookshelf.model('Playlist', Playlist);;
