import { Model, DataTypes } from "sequelize";
import sequelize from "../database"; // Adjust the path to your Sequelize instance

class Bio extends Model {
  public id!: number;
  public bioText!: string;
  public profilePictureUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Bio.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    bioText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    profilePictureUrl: {
      type: new DataTypes.STRING(2048),
      allowNull: true,
    },
  },
  {
    tableName: "Bios",
    sequelize,
  }
);

export default Bio;
