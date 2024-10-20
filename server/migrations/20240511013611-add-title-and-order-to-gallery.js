"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("gallery", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("gallery", "order", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("gallery", "title");
    await queryInterface.removeColumn("gallery", "order");
  },
};
