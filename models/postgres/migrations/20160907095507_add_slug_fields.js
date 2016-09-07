
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.string('slug');
    }),
    knex.schema.table('repos', function (table) {
      table.string('slug');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('slug');
    }),
    knex.schema.table('repos', function (table) {
      table.dropColumn('slug');
    }),
  ]);
};
