"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("SelectedWorks", "selectedSeriesId", {
      type: Sequelize.INTEGER,
      references: {
        model: "SelectedSeries",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("SelectedWorks", "selectedSeriesId");
  },
};
