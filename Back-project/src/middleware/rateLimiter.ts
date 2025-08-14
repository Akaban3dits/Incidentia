import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

/**
 * Limitador de peticiones en memoria por IP.
 * 
 * Configuración:
 * - `points`: número máximo de peticiones permitidas en el intervalo.
 * - `duration`: intervalo de tiempo en segundos.
 * - `keyPrefix`: prefijo para diferenciar este limitador en la memoria.
 * 
 * Nota: Este limitador es por IP y utiliza memoria del servidor,
 *       adecuado para entornos de una sola instancia.
 */
const rateLimiter = new RateLimiterMemory({
  points: 40,          // Máximo 40 solicitudes
  duration: 60,        // Intervalo de 60 segundos
  keyPrefix: "rateLimiter",
});

/**
 * Middleware de limitación de peticiones.
 * 
 * Flujo:
 * 1. Obtiene la IP del cliente desde `req.ip`.
 * 2. Intenta consumir un punto del limitador.
 * 3. Si no se supera el límite, continúa al siguiente middleware.
 * 4. Si se excede el límite, responde con estado 429 (Too Many Requests)
 *    y un mensaje amigable al cliente.
 * 
 * @param req Objeto de solicitud de Express
 * @param res Objeto de respuesta de Express
 * @param next Función para pasar al siguiente middleware o ruta
 */
const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || "unknown-ip";  // Obtiene IP del cliente
    await rateLimiter.consume(ip);      // Consume un punto, falla si se excede
    next();                             // Continúa si no se supera el límite
  } catch (rejRes) {
    // Error 429 cuando se excede el límite
    res.status(429).json({
      error:
        "Haz excedido el número de solicitudes permitidas. Intenta nuevamente más tarde.",
    });
  }
};

export default rateLimiterMiddleware;
