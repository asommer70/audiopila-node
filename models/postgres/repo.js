var bookshelf = require('./db');
var Pila = require('./pila');
var Audio = require('./audio');
var ModelHelpers = require('../../lib/model_helpers');

var Repo = bookshelf.Model.extend({
  tableName: 'repos',
  pila: function() {
    return this.belongsTo('Pila');
  },
  audios: function() {
    return this.hasMany('Audio');
  },
  hasTimestamps: true
}, {
  all: function() {
    return this.fetchAll()
      .then((repos) => {
        return this.makeObject(repos, 'slug');
      });
  },
  findBySlug: function(slug) {
    return this.where('slug', slug).fetch({withRelated: ['pila', 'audios']});
  },
  makeObject: ModelHelpers.makeObject
});

module.exports = bookshelf.model('Repo', Repo);
