import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
import path from "path";
import passport from "passport";
import { setupSwagger } from "./config/swagger";
import { initializeDatabase } from "./db/initializeDatabase";
import routes from "./routes";
import "./config/passport";
import errorHandler from "./middleware/errorHandler";
import { UserService } from "./services/user.service";
import { UserRole } from "./enums/userRole.enum";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(morgan("dev"));

app.use(passport.initialize());
setupSwagger(app);

app.use("/api", routes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
const HOST = "localhost";

const startServer = async () => {
  try {
    await initializeDatabase();
    const admin = await UserService.findOneByRole(UserRole.Administrador);
    app.listen(PORT, HOST, () => {
      console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
      console.log("Puedes probar en tu navegador con tu IP local.");
      console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
      if (!admin) {
        console.log("⚠️ No existe un usuario con rol Administrador. Accede aquí para generar uno:");
        console.log(`http://localhost:${PORT}/api/auth/google/admin`);
      }
    });
  } catch (error) {
    console.error("Error iniciando la app:", error);
    process.exit(1);
  }
};

startServer();
