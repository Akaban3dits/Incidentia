import path from "path";
import dotenv from "dotenv";
import { initializeDatabase } from "../db/initializeDatabase";
import Department from "../models/department.model";
import DeviceType from "../models/deviceType.model";
import User from "../models/user.model";
import Device from "../models/device.model";
import Ticket from "../models/ticket.model";

process.env.NODE_ENV = "test";

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

beforeAll(async () => {
  await initializeDatabase();
});

beforeEach(async () => {
  await Ticket.destroy({ where: {} });     
  await Device.destroy({ where: {} });     
  await DeviceType.destroy({ where: {} });  
  await User.destroy({ where: {} });        
  await Department.destroy({ where: {} });  
});

afterAll(async () => {
  await Ticket.sequelize?.close();
  await Device.sequelize?.close();
  await DeviceType.sequelize?.close();
  await Department.sequelize?.close();
  await User.sequelize?.close();
});
