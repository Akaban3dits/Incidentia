// src/db/initializeDatabase.ts
import { ensureDatabaseExists } from "./createDatabase";
import { sequelize } from "../config/sequelize";
import models from "../models";
import logger from "../utils/logger";
import { runMigrations } from "./migrator";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info("Conexión a la base de datos establecida.");

    const qi = sequelize.getQueryInterface();
    const allTables = await qi.showAllTables();
    const tableNames = (allTables as any[]).map(t => typeof t === "string" ? t : t.tableName);
    const hasTickets = tableNames.includes("tickets");

    if (!hasTickets) {
      await sequelize.sync();
      logger.info("Esquema base creado con sequelize.sync().");
    }

    await runMigrations();
    logger.info("Migraciones aplicadas.");

    Object.values(models).forEach((model) => {
      if ("associate" in model && typeof (model as any).associate === "function") {
        (model as any).associate(sequelize.models);
      }
    });
    
    if (process.env.DB_SYNC_DEV === "true") {
      await sequelize.sync();
      logger.info("Modelos verificados.");
    }
  } catch (error) {
    logger.error("Error inicializando la base de datos:", error);
    throw error;
  }
};
