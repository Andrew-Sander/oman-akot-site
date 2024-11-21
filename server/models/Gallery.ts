import { Model, DataTypes } from "sequelize";
import sequelize from "../database"; // import your Sequelize instance

class Gallery extends Model {
  public id!: number;
  public imageUrl!: string; // URL pointing to the image
  public description?: string; // Optional description
  public title!: string;
  public order!: number;
  public available!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Gallery.init(
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
    description: {
      type: new DataTypes.STRING(2048),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING, // Add title column
    },
    order: {
      type: DataTypes.INTEGER, // Add order column
    },
    available: {
      type: DataTypes.BOOLEAN, // New field
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "gallery",
    sequelize, // passing the `sequelize` instance is required
  }
);

export default Gallery;
