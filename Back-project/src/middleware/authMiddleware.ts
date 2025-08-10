import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware para proteger rutas verificando el token JWT en el header Authorization
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extrae el token del header Authorization (formato "Bearer <token>")
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    // Si no hay token, devuelve error 401 (no autorizado)
    res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó un token" });
    return;
  }

  try {
    // Verifica el token con la clave secreta (JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // Agrega la info decodificada al objeto req para usarla en los controladores
    (req as any).user = decoded;
    next(); // Continúa con la siguiente función middleware o ruta
  } catch (error) {
    // Si el token es inválido o expiró, devuelve error 401
    res.status(401).json({ message: "Token inválido" });
    return;
  }
};

export default authMiddleware;
