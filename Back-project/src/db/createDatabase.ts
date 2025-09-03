import { Client } from "pg";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "../config/env";
import logger from "../utils/logger";

export const ensureDatabaseExists = async (): Promise<void> => {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (res.rowCount === 0) {
      logger.info(`Base de datos "${DB_NAME}" no existe. Creando...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      logger.info(`Base de datos "${DB_NAME}" creada correctamente.`);
    } else {
      logger.info(`Base de datos "${DB_NAME}" ya existe.`);
    }
  } catch (error) {
    logger.error("Error verificando o creando la base de datos:", error);
    throw error;
  } finally {
    await client.end();
  }
};
