exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('playlists', function(table) {
      table.increments('id').primary();

      table.string('name').unique().notNullable();
      table.string('slug');

      table.integer('pila_id');
      table.foreign('pila_id').references('pilas.id');

      table.timestamps();
    }),
    knex.schema.createTable('audios_playlists', function(table) {
      table.increments('id').primary();

      table.integer('audio_id');
      table.integer('playlist_id');

      table.foreign('audio_id').references('audios.id');
      table.foreign('playlist_id').references('playlists.id');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('audios_playlists'),
    knex.schema.dropTable('playlists'),
  ]);
};
