var config = require('../../config/knexfile')['development'];

var knex = require('knex')(config);
var bookshelf = require('bookshelf')(knex);
var cascadeDelete = require('bookshelf-cascade-delete');
bookshelf.plugin('registry');
bookshelf.plugin(cascadeDelete);

module.exports = bookshelf;
