// module.exports = {
//   "dialect": "postgres",
//   "username": "adam",
//   "password": null,
//   "database": "audiopila",
//   "host": "127.0.0.1",
// }

// module.exports = {
//   "dialect": "local",
//   "path": './db/audiopila.db',
// }

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
  }
}


//
// sequelize command:
// node_modules/.bin/sequelize db:migrate --migrations-path models/postgres/migrations --models-path models/postgres --config config/db.js
