import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not set.");
}
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;
