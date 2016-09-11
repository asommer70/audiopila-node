
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('lastPlayed');
    }),
    knex.schema.table('pilas', function (table) {
      table.string('lastPlayed');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('lastPlayed');
    }),
    knex.schema.table('pilas', function (table) {
      table.integer('lastPlayed');
    }),
  ]);
};
