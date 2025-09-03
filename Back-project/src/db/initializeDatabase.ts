import { ensureDatabaseExists } from "./createDatabase";
import { sequelize } from "../config/sequelize";
import models from "../models";
import logger from "../utils/logger";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await ensureDatabaseExists();

    await sequelize.authenticate();
    logger.info("Conexión a la base de datos establecida.");

    Object.values(models).forEach((model) => {
      if ("associate" in model && typeof (model as any).associate === "function") {
        (model as any).associate(sequelize.models);
      }
    });

    await sequelize.sync({ alter: true });
    logger.info("Modelos sincronizados correctamente.");
  } catch (error) {
    logger.error("Error inicializando la base de datos:", error);
    throw error;
  }
};
