'use strict';
var Pila = require('./pila');

module.exports = function(sequelize, DataTypes) {
  var Repo = sequelize.define('repo', {
    name: {type: DataTypes.STRING, notNull: true, unique: true},
    path: DataTypes.STRING,
    pila_id:  {
      type: DataTypes.INTEGER,
      references: {
        model: Pila,
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
   }
  }, {

    getterMethods: {
      slug: function()  {
        return this.name.replace(' ', '_').replace("'", '').toLowerCase();
      },
    },

    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },

      findBySlug: function(slug) {
        return this.findOne({ where: {slug: slug} });
      }
    },
  });
  return Repo;
};
