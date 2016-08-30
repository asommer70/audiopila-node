'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pila = sequelize.define('pila', {
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
        console.log('name:', name);
        return this.findOne({ where: {name: name} });
      },

      addPila: function(pila) {
        return this.create(pila);
      },

      all: function() {
        return this.findAll({plain: true});
      },
    },
  });
  return Pila;
};
