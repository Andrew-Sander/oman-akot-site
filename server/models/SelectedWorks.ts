import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";

interface SelectedWorksAttributes {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type SelectedWorksCreationAttributes = Optional<SelectedWorksAttributes, "id">;

class SelectedWorks
  extends Model<SelectedWorksAttributes, SelectedWorksCreationAttributes>
  implements SelectedWorksAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public imageUrl!: string;
  public order!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SelectedWorks.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize, // Pass your Sequelize instance
    tableName: "SelectedWorks", // Define the table name
    timestamps: true, // Include createdAt and updatedAt fields
  }
);

export default SelectedWorks;
