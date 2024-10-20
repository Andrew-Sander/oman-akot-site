// migrations/YYYYMMDDHHMMSS-add-profilePictureUrl-to-bio.ts
"use strict";

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn("Bios", "profilePictureUrl", {
      type: DataTypes.STRING(2048),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Bios", "profilePictureUrl");
  },
};
