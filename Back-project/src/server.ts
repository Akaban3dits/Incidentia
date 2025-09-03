import app from "./app";
import { initializeDatabase } from "./db/initializeDatabase";
import { UserService } from "./services/user.service";
import { UserRole } from "./enums/userRole.enum";
import logger from "./utils/logger";

const PORT = Number(process.env.PORT) || 3000;
const HOST = "localhost";

const startServer = async () => {
  try {
    await initializeDatabase();
    const admin = await UserService.findOneByRole(UserRole.Administrador);

    app.listen(PORT, HOST, () => {
      logger.info(`Servidor escuchando en http://${HOST}:${PORT}`);
      logger.info("Puedes probar en tu navegador con tu IP local.");
      logger.info(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
      if (!admin) {
        logger.info("⚠️ No existe un usuario con rol Administrador. Accede aquí para generar uno:");
        logger.info(`http://localhost:${PORT}/api/auth/google/admin`);
      }
    });
  } catch (error) {
    logger.error("Error iniciando la app:", error);
    process.exit(1);
  }
};

startServer();
