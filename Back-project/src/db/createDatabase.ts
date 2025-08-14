import { Client } from "pg";
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} from "../config/env";

/**
 * Asegura que la base de datos especificada en las variables de entorno exista.
 * 
 * Flujo:
 * 1. Se conecta a la base de datos predeterminada `postgres` para poder listar/crear otras bases.
 * 2. Verifica si la base especificada (`DB_NAME`) ya existe en `pg_database`.
 * 3. Si no existe, la crea con el nombre indicado.
 * 4. Cierra la conexión sin importar si hubo error o no.
 * 
 * Uso:
 * - Ideal para scripts de inicialización del proyecto.
 * - Se ejecuta antes de la conexión principal de la app.
 * 
 */
export const ensureDatabaseExists = async (): Promise<void> => {
  // Conexión temporal a la base "postgres" para gestionar otras bases de datos
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres", // Base por defecto para tareas administrativas
  });

  try {
    await client.connect();

    // Verifica si la base de datos deseada ya existe
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    // Si no existe, se crea
    if (res.rowCount === 0) {
      console.log(`Base de datos "${DB_NAME}" no existe. Creando...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Base de datos "${DB_NAME}" creada correctamente.`);
    } else {
      console.log(`Base de datos "${DB_NAME}" ya existe.`);
    }
  } catch (error) {
    console.error("Error verificando o creando la base de datos:", error);
    throw error; // Propaga el error para que el flujo que llama pueda manejarlo
  } finally {
    await client.end(); // Se asegura de cerrar la conexión
  }
};
