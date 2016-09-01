'use strict';

module.exports = function(sequelize, DataTypes) {
  var Audio = sequelize.define('audio', {
    name: {type: DataTypes.STRING, notNull: true},
    path: DataTypes.STRING,
    httpUrl: DataTypes.STRING,
    duration: DataTypes.FLOAT,
    playbackTime: DataTypes.FLOAT,
    playedTime: DataTypes.INTEGER,
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
      },

      //
      // add: function(name, path, baseUrl) {
      //   this.create
      // },

      all: function() {
        return this.findAll({plain: true});
      },
    },
  });
  return Audio;
};
