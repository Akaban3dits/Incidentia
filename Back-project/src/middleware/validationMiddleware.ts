import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware para procesar resultados de validaciones de express-validator.
 * 
 * Flujo:
 * 1. Revisa si hay errores de validación en la solicitud.
 * 2. Si existen errores:
 *    - Toma el primer error.
 *    - Devuelve un status 400 con el mensaje del error.
 * 3. Si no hay errores, pasa al siguiente middleware o controlador.
 * 
 * Uso:
 * - Se coloca después de las reglas de validación definidas con express-validator.
 * - Permite enviar respuestas claras y consistentes en caso de validaciones fallidas.
 * 
 * @param req Objeto de solicitud de Express
 * @param res Objeto de respuesta de Express
 * @param next Función para pasar al siguiente middleware o ruta
 */
export const validationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Obtiene errores de la solicitud
  const errors = validationResult(req);

  // Si hay errores, devuelve el primero en la respuesta
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    res.status(400).json({
      error: firstError.msg, // Mensaje claro del error
    });
    return; // Detiene el flujo
  }

  // Si no hay errores, continúa con la siguiente función
  next();
};
