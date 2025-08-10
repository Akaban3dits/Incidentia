import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

// Crea un limitador de memoria que permite 40 peticiones por IP cada 60 segundos
const rateLimiter = new RateLimiterMemory({
  points: 40,          // Número máximo de peticiones permitidas
  duration: 1 * 60,    // Duración del intervalo en segundos (1 minuto)
  keyPrefix: "rateLimiter",
});

// Middleware que aplica la limitación por IP
const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || "unknown-ip";  // Obtiene la IP del cliente
    await rateLimiter.consume(ip);      // Consume un punto, falla si se supera el límite
    next();                            // Si no excede, pasa al siguiente middleware
  } catch (rejRes) {
    // Si se excede el límite, responde con error 429 (Too Many Requests)
    res.status(429).json({
      error:
        "Haz excedido el número de solicitudes permitidas. Intenta nuevamente más tarde.",
    });
  }
};

export default rateLimiterMiddleware;
