import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Carga variables de entorno

// Define el origen permitido para CORS (frontend), con fallback a localhost
const origin = process.env.FRONTEND_URL || "http://localhost:5000";

// Opciones para configurar CORS
const corsOptions = {
  origin: origin,                          // Permite solo este origen
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Métodos HTTP permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
  credentials: true,                       // Permite enviar cookies/autenticación
};

// Middleware de CORS configurado con estas opciones
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
