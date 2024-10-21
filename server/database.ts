import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import pg from "pg";

dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not set.");
}
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  dialectModule: pg,
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false, // For self-signed certificates
  //   },
  // },
  logging: false,
});

export default sequelize;
