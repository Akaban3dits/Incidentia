import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de entorno desde el archivo .env

// Define el origen permitido para CORS (frontend).
// Usa FRONTEND_URL desde variables de entorno o por defecto localhost:5000.
const origin = process.env.FRONTEND_URL || "http://localhost:5000";

/**
 * Opciones de configuración para el middleware CORS.
 * 
 * - `origin`: Especifica qué origen puede hacer solicitudes.
 * - `methods`: Lista de métodos HTTP permitidos desde el cliente.
 * - `allowedHeaders`: Lista de headers permitidos en la solicitud.
 * - `credentials`: Permite enviar cookies o credenciales junto con la solicitud.
 * 
 * Notas:
 * - En producción es recomendable definir un origen específico en lugar de "*".
 * - `credentials: true` solo funciona si el cliente también envía la opción `withCredentials`.
 */
const corsOptions = {
  origin: origin, // Solo permite este origen
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Headers que el cliente puede enviar
  credentials: true, // Permitir cookies/credenciales cruzadas
};

// Middleware de CORS configurado con las opciones anteriores
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
