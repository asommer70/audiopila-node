
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.string('baseUrl');
      table.string('syncUrl');
      table.string('syncedFrom');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('pilas', function (table) {
      table.dropColumn('baseUrl');
      table.dropColumn('syncUrl');
      table.dropColumn('syncedFrom');
    }),
  ]);
};
