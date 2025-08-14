import { ensureDatabaseExists } from "./createDatabase";
import { sequelize } from "../config/sequelize";
import models from "../models";

/**
 * Inicializa la base de datos para la aplicación.
 * 
 * Flujo:
 * 1. Verifica que la base de datos exista (y la crea si no).
 * 2. Prueba la conexión usando Sequelize.
 * 3. Configura las asociaciones entre modelos (si tienen `associate` definido).
 * 4. Sincroniza el esquema de la base con los modelos (`sequelize.sync`).
 * 
 * Notas:
 * - `alter: true` ajusta las tablas para que coincidan con el modelo sin borrar datos,
 *   pero puede causar cambios no deseados en producción.
 * - En entornos productivos es más seguro usar migraciones.
 * 
 * @throws Error si ocurre un fallo en la verificación, conexión o sincronización.
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Verifica o crea la base de datos antes de conectar con Sequelize
    await ensureDatabaseExists();

    // Prueba de conexión
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida.");

    // Configura asociaciones si los modelos las definen
    Object.values(models).forEach((model) => {
      if ("associate" in model && typeof model.associate === "function") {
        model.associate(sequelize.models);
      }
    });

    // Sincroniza modelos con la base de datos
    // "alter: true" modifica las tablas existentes para coincidir con los modelos
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados correctamente.");
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
    throw error; // Propaga para que el flujo principal decida cómo manejarlo
  }
};
