import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

// Middleware para capturar y responder a errores en la aplicación
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Loguea el error en consola para depuración

  // Si es un error personalizado (AppError), responde con su código y mensaje
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Para errores no controlados, responde con error 500 genérico
  return res.status(500).json({ error: "Error interno del servidor" });
};

export default errorHandler;
