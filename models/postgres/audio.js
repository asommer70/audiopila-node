'use strict';
module.exports = function(sequelize, DataTypes) {
  var Audio = sequelize.define('Audio', {
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
      }
    },
  });
  return Audio;
};
