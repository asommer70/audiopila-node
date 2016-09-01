var bookshelf = require('./db');
var Pila = require('./pila');
var Repo = require('./repo');

var Audio = bookshelf.Model.extend({
  tableName: 'audios',
  pila: function() {
    return this.belongsTo('Pila');
  },
  repo: function() {
    return this.belongsTo('Repo');
  },
  hasTimestamps: true
});

module.exports = bookshelf.model('Audio', Audio);;
