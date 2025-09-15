import dotenv from "dotenv";
dotenv.config(); 

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno ${envVar} no definida`);
  }
}

export const DB_HOST = process.env.DB_HOST!;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
export const DB_NAME = process.env.DB_NAME!;
