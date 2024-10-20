import { Model, DataTypes } from "sequelize";
import sequelize from "../database";

class CV extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public pdfUrl!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CV.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    pdfUrl: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
  },
  {
    tableName: "CV",
    sequelize, // Passing the `sequelize` instance is required
  }
);

export default CV;
