
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.string('type');
    }),
    knex.schema.table('repos', function (table) {
      table.string('type');
    }),
    knex.schema.table('audios', function (table) {
      table.string('type');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('type');
    }),
    knex.schema.table('repos', function (table) {
      table.dropColumn('type');
    }),
    knex.schema.table('audios', function (table) {
      table.dropColumn('type');
    }),
  ]);
};
