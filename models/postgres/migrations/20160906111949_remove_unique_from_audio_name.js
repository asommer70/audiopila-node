
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('name');
    }),
    knex.schema.table('audios', function (table) {
      table.string('name');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('name');
    }),
    knex.schema.table('audios', function (table) {
      table.string('name').unique().notNullable();
    }),
  ]);
};
