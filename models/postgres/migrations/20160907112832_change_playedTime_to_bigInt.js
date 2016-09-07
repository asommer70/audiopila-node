
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('playedTime');
    }),
    knex.schema.table('audios', function (table) {
      table.bigInteger('playedTime');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('audios', function (table) {
      table.dropColumn('playedTime');
    }),
    knex.schema.table('audios', function (table) {
      table.integer('playedTime');
    }),
  ]);
};
