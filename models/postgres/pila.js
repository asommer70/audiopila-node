'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pila = sequelize.define('Pila', {
    name: {type: DataTypes.STRING, notNull: true, unique: true},
    platform: DataTypes.STRING,
    lastSynced: DataTypes.INTEGER,
    syncedTo: DataTypes.STRING,
    lastPlayed: DataTypes.INTEGER
  }, {

    getterMethods: {
    },

    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
  });
  return Pila;
};
