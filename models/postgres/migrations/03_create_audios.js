
exports.up = function(knex, Promise) {
  return knex.schema.createTable('audios', function(table) {
    table.increments('id').primary();

    table.string('name').unique().notNullable();
    table.string('path');
    table.string('httpUrl');
    table.float('duration');
    table.float('playbackTime');
    table.integer('playedTime')

    table.integer('pila_id');
    table.foreign('pila_id').references('pilas.id');
    table.integer('repo_id');
    table.foreign('repo_id').references('repos.id');

    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('audios');
};
