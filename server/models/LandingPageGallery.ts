import { Model, DataTypes } from "sequelize";
import sequelize from "../database"; // Import your Sequelize instance

class LandingPageGallery extends Model {
  public id!: number;
  public imageUrl!: string;
  public order!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

LandingPageGallery.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    imageUrl: {
      type: new DataTypes.STRING(2048),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "landingPageGallery",
    sequelize, // passing the `sequelize` instance is required
    timestamps: true, // This adds createdAt and updatedAt columns
  }
);

export default LandingPageGallery;
