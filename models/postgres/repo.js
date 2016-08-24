'use strict';
module.exports = function(sequelize, DataTypes) {
  var Repo = sequelize.define('Repo', {
    name: {type: DataTypes.STRING, notNull: true, unique: true},
    path: DataTypes.STRING,
  }, {

    getterMethods: {
      slug: function()  {
        return this.name.replace(' ', '_').replace("'", '').toLowerCase();
      },
    },

    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
  });
  return Repo;
};
