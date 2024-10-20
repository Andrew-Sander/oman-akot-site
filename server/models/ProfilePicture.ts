import { Model, DataTypes } from "sequelize";
import sequelize from "../database"; // Adjust the path to your Sequelize instance

class ProfilePicture extends Model {
  public id!: number;
  public imageUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ProfilePicture.init(
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
  },
  {
    tableName: "ProfilePictures",
    sequelize,
  }
);

export default ProfilePicture;
