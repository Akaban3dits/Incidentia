import { Sequelize } from "sequelize";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "./env"; 

export const sequelize = new Sequelize({
  dialect: "postgres",       
  host: DB_HOST,             
  port: DB_PORT,             
  username: DB_USER,         
  password: DB_PASSWORD,     
  database: DB_NAME,         
  logging: false,            
});
