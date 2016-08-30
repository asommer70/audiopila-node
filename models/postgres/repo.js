'use strict';
module.exports = function(sequelize, DataTypes) {
  var Repo = sequelize.define('repo', {
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
      },

      findBySlug: function(slug) {
        return this.findOne({ where: {slug: slug} });
      }
    },
  });
  return Repo;
};
