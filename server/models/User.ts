// models/user.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import bcrypt from "bcryptjs";

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public role!: string;

  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async validPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    role: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: "Users",
    sequelize,
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await User.hashPassword(user.password);
      },
    },
  }
);

export default User;
