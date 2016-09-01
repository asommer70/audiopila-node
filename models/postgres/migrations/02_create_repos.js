
exports.up = function(knex, Promise) {
  return knex.schema.createTable('repos', function(table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('path');
    table.integer('pila_id');
    table.foreign('pila_id').references('pilas.id');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('repos');
};
