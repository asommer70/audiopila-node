var bookshelf = require('./db');
var Pila = require('./pila');
var Repo = require('./repo');
var ModelHelpers = require('../../lib/model_helpers');

var Audio = bookshelf.Model.extend({
  tableName: 'audios',
  pila: function() {
    return this.belongsTo('Pila');
  },
  repo: function() {
    return this.belongsTo('Repo');
  },
  hasTimestamps: true
}, {
  all: function(page) {
    if (!page) {
      page = 0;
    }
    return this.fetchPage({page: page, pageSize: 20})
      .then((audios) => {
        return this.makeObject(audios, 'slug');
      });
  },
  findBySlug: function(slug) {
    return this.where('slug', slug).fetch({withRelated: ['pila', 'repo']});
  },
  delete: function(slug) {
    return this.where('slug', slug).fetch({withRelated: ['pila', 'repo']})
      .then((audio) => {
        return audio.destroy();
      })
  },
  makeObject: ModelHelpers.makeObject
});

module.exports = bookshelf.model('Audio', Audio);;
