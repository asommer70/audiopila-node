'use strict';
var Pila = require('../pila');

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addColumn(
    'repos',
    'pila_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: Pila,
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    )

    // queryInterface.addColumn({
    //   tableName: 'repos',
    //   schema: 'public'
    // },
    //   'pila_id',
    //   Sequelize.INTEGER
    // );
    //
    //
    // queryInterface.addIndex(
    //   'repos',
    //   'pila_id',
    //   {
    //     references: {
    //       model: 'pilas',
    //       key: 'id'
    //     }
    //   }
    // );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('repos', 'pila_id');
    // queryInterface.removeIndex('repos', 'pila_id');
  }
}
