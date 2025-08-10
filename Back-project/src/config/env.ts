import dotenv from "dotenv";
dotenv.config(); // Carga las variables de entorno desde el archivo .env

// Lista de variables de entorno obligatorias para conectar a la base de datos
const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

// Verifica que todas las variables requeridas estén definidas
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno ${envVar} no definida`);
  }
}

// Exporta las variables ya validadas y listas para usarse en la app
export const DB_HOST = process.env.DB_HOST!;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
export const DB_NAME = process.env.DB_NAME!;
