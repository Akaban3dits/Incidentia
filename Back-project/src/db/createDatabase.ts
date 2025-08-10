import { Client } from "pg";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "../config/env";

// Función que asegura que la base de datos especificada exista; si no, la crea
export const ensureDatabaseExists = async (): Promise<void> => {
  // Se conecta a la base "postgres" para poder consultar/crear otras bases
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres", // Base por defecto desde donde se gestionan otras
  });

  try {
    await client.connect();

    // Verifica si ya existe la base de datos deseada
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    // Si no existe, la crea
    if (res.rowCount === 0) {
      console.log(`Base de datos "${DB_NAME}" no existe. Creando...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Base de datos "${DB_NAME}" creada correctamente.`);
    } else {
      console.log(`Base de datos "${DB_NAME}" ya existe.`);
    }
  } catch (error) {
    console.error("Error verificando o creando la base de datos:", error);
    throw error;
  } finally {
    await client.end(); // Cierra la conexión con PostgreSQL
  }
};
