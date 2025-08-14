import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware para proteger rutas mediante verificación de JWT.
 * 
 * Flujo:
 * 1. Obtiene el token desde el encabezado `Authorization` en formato `Bearer <token>`.
 * 2. Si no hay token, responde con un error 401 (no autorizado).
 * 3. Verifica el token usando `JWT_SECRET`.
 * 4. Si es válido, agrega la información decodificada (`decoded`) al objeto `req` para uso posterior.
 * 5. Si es inválido o ha expirado, responde con un error 401.
 * 
 * Notas:
 * - La información agregada a `req.user` puede incluir datos sensibles,
 *   por lo que se recomienda no exponerla directamente en las respuestas.
 * - Requiere que la variable de entorno `JWT_SECRET` esté definida.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Obtiene el token del header "Authorization"
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    // No se proporcionó token → Acceso denegado
    res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó un token" });
    return;
  }

  try {
    // Verifica y decodifica el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // Agrega la información decodificada al request para uso en controladores
    (req as any).user = decoded;

    // Continúa con el siguiente middleware o controlador
    next();
  } catch (error) {
    // Token inválido o expirado → acceso no autorizado
    res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;
