module.exports = {
  local: {
    "dialect": "local",
    "path": './db/audiopila.db',
  },

  development: {
    dialect: "postgres",
    username: "adam",
    password: null,
    database: "audiopila",
    host: "127.0.0.1",
  },

  test: {
    dialect: "postgres",
    username: "adam",
    password: null,
    database: "audiopila_test",
    host: "127.0.0.1",
  }
}
