import path from "path";
import dotenv from "dotenv";
import { initializeDatabase } from "../db/initializeDatabase";
import Department from "../models/department.model";

process.env.NODE_ENV = "test";

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

beforeAll(async () => {
  await initializeDatabase();
});

beforeEach(async () => {
  await Department.destroy({ where: {} });
});

afterAll(async () => {
  await Department.sequelize?.close();
});
