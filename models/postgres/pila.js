'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pila = sequelize.define('Pila', {
    name: {type: DataTypes.STRING, notNull: true, unique: true},
    platform: DataTypes.STRING,
    lastSynced: DataTypes.INTEGER,
    syncedTo: DataTypes.STRING,
    lastPlayed: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },

      findByName: function(name) {
        return this.findOne({ where: {name: name} });
      }
    },
  });
  return Pila;
};
