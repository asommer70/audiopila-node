
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pilas', function(table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('platform');
    table.integer('lastSynced');
    table.string('syncedTo');
    table.integer('lastPlayed');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pilas');
};
