import { ensureDatabaseExists } from "./createDatabase";
import { sequelize } from "../config/sequelize";
import models from "../models";

// Función que inicializa la base de datos:
// - Garantiza que la base exista
// - Establece conexión con Sequelize
// - Asocia modelos si tienen relaciones definidas
// - Sincroniza los modelos con la base (crea/actualiza tablas)
export const initializeDatabase = async (): Promise<void> => {
  try {
    await ensureDatabaseExists(); // Verifica o crea la base de datos

    await sequelize.authenticate(); // Prueba conexión con la DB
    console.log("Conexión a la base de datos establecida.");

    // Establece asociaciones entre modelos si están definidas
    Object.values(models).forEach((model) => {
      if ("associate" in model && typeof model.associate === "function") {
        model.associate(sequelize.models);
      }
    });

    await sequelize.sync({ alter: true }); // Sincroniza tablas según modelos (ajusta esquema)
    console.log("Modelos sincronizados correctamente.");
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
    throw error;
  }
};
