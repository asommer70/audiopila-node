
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('lastSynced');
    }),
    knex.schema.table('pilas', function (table) {
      table.bigInteger('lastSynced');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('lastSynced');
    }),
    knex.schema.table('pilas', function (table) {
      table.integer('lastSynced');
    }),
  ]);
};
