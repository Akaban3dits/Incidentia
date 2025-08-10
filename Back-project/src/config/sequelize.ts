import { Sequelize } from "sequelize";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "./env"; // Importa las variables de entorno ya validadas

// Crea una instancia de Sequelize configurada para conectarse a PostgreSQL
export const sequelize = new Sequelize({
  dialect: "postgres",       // Especifica el motor de base de datos
  host: DB_HOST,             // Dirección del servidor
  port: DB_PORT,             // Puerto de conexión
  username: DB_USER,         // Usuario de la base de datos
  password: DB_PASSWORD,     // Contraseña
  database: DB_NAME,         // Nombre de la base de datos
  logging: false,            // Desactiva logs SQL en consola
});
