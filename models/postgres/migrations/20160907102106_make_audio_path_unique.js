
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('path');
    }),
    knex.schema.table('audios', function (table) {
      table.string('path').unique();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('path');
    }),
    knex.schema.table('audios', function (table) {
      table.string('path');
    }),
  ]);
};
