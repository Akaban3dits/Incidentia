import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/error";

/**
 * Middleware global para manejar errores.
 * - Guarda los errores en un archivo dentro de la carpeta `logs/`.
 * - Registra la fecha, método, ruta, mensaje y stack del error.
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Directorio donde se guardarán los logs
  const logsDir = path.join(__dirname, "..", "logs");

  // Crea la carpeta si no existe
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Nombre del archivo de log por día (ej: 2025-08-13.log)
  const logFile = path.join(logsDir, `${new Date().toISOString().slice(0, 10)}.log`);

  // Texto del log
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  }\nMensaje: ${err.message}\nStack: ${err.stack || "No stack"}\n\n`;

  // Guarda el log (append para no sobreescribir)
  fs.appendFileSync(logFile, logMessage, "utf-8");

  // También loguea en consola para debug rápido
  console.error(err);

  // Si es un error controlado
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Si es un error inesperado
  return res.status(500).json({ error: "Error interno del servidor" });
};

export default errorHandler;
