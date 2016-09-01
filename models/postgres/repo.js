var bookshelf = require('./db');
var Pila = require('./pila');
var ModelHelpers = require('../../lib/model_helpers');

var Repo = bookshelf.Model.extend({
  tableName: 'repos',
  pila: function() {
    return this.belongsTo('Pila');
  },
  hasTimestamps: true
});

module.exports = bookshelf.model('Repo', Repo);;