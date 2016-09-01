var config = require('../../config/knexfile')['development'];

var knex = require('knex')(config);
var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = bookshelf;
