import sequelizeInstance from "../database"; // Adjust the path as necessary
import SelectedSeries from "./SelectedSeries";
import SelectedWorks from "./SelectedWorks";

// Define associations
SelectedSeries.hasMany(SelectedWorks, {
  sourceKey: "id",
  foreignKey: "selectedSeriesId",
  as: "selectedWorks",
  onDelete: "CASCADE",
});

SelectedWorks.belongsTo(SelectedSeries, {
  targetKey: "id",
  foreignKey: "selectedSeriesId",
  as: "selectedSeries",
});

// Export models and sequelize instance
export { sequelizeInstance as sequelize, SelectedSeries, SelectedWorks };
