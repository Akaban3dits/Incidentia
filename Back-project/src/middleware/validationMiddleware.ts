import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// Middleware para manejar errores de validación de express-validator
export const validationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req); // Obtiene errores de validación del request
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]; // Toma el primer error encontrado
    res.status(400).json({
      error: firstError.msg, // Devuelve mensaje de error claro
    });
    return; // Detiene el flujo si hay errores
  }

  next(); // Si no hay errores, continúa con siguiente middleware o ruta
};
