var bookshelf = require('./db');
var Repo = require('./repo');
var Audio = require('./audio');
var ModelHelpers = require('../../lib/model_helpers');

var Pila = bookshelf.Model.extend({
  tableName: 'pilas',
  repos: function() {
    return this.hasMany('Repo');
  },
  audios: function() {
    return this.hasMany('Audio');
  },
  hasTimestamps: true
}, {
  findByName: function(name) {
    return this.where('name', name).fetch({withRelated: ['audios', 'repos']});
  },
  addPila: function(pila) {
    console.log('pila:', pila);
    return new Pila(pila).save();
  },
  all: function() {
    return this.fetchAll()
      .then((pilas) => {
        return this.makeObject(pilas, 'name');
      });
  },
  dependents: ['repos', 'audios'],
  makeObject: ModelHelpers.makeObject
});

module.exports = bookshelf.model('Pila', Pila);
