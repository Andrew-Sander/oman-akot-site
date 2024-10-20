import { Model, DataTypes } from "sequelize";
import sequelize from "../database"; // import your Sequelize instance

class Settings extends Model {
  public id!: number;
  public backgroundImageUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    backgroundImageUrl: {
      type: new DataTypes.STRING(2048),
      allowNull: false,
    },
  },
  {
    tableName: "settings",
    sequelize, // passing the `sequelize` instance is required
  }
);

export default Settings;
