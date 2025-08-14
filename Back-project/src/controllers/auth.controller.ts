import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../utils/error";

/**
 * Controlador de autenticación que gestiona el inicio de sesión
 * y la creación de administradores mediante Google OAuth.
 * 
 * Usa `passport` para manejar la autenticación con Google,
 * y `jsonwebtoken` para emitir tokens JWT.
 */
export class AuthController {

  /**
   * Inicia el flujo de autenticación de Google para usuarios normales.
   * Redirige al usuario a la página de autorización de Google.
   */
  static googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-user", { scope: ["profile", "email"] })(req, res, next);
  }

  /**
   * Callback que maneja la respuesta de Google después de la autenticación
   * para usuarios normales.
   * 
   * - Verifica si la autenticación fue exitosa.
   * - Si lo fue, genera un token JWT con los datos básicos del usuario.
   * - Responde con el token y la información del usuario.
   */
  static googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google-user",
      { session: false },
      (err: Error | null, user: any, info?: any) => {
        if (err) return next(new InternalServerError("Error en autenticación con Google"));
        if (!user) return next(new UnauthorizedError(info?.message || "Autenticación fallida"));

        try {
          // Datos que incluirá el token (solo lo esencial por seguridad)
          const payload = {
            id: user.user_id,
            email: user.email,
            role: user.role,
          };

          // Validación de que la clave secreta JWT esté configurada
          const secret = process.env.JWT_SECRET;
          if (!secret) throw new InternalServerError("JWT_SECRET no está definido");

          // Firma del token con expiración de 1 hora
          const token = jwt.sign(payload, secret, { expiresIn: "1h" });

          // Respuesta final al cliente
          return res.json({ token, user: payload });
        } catch {
          return next(new InternalServerError("Error al generar token"));
        }
      }
    )(req, res, next);
  }

  /**
   * Inicia el flujo de autenticación de Google para crear un administrador.
   * Esto debería usarse solo una vez o bajo control, ya que crea usuarios con rol alto.
   */
  static googleAdminAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-admin", { scope: ["profile", "email"] })(req, res, next);
  }

  /**
   * Callback que maneja la respuesta de Google después de la autenticación
   * para creación de administradores.
   * 
   * - Verifica si la autenticación fue exitosa.
   * - Si lo fue, genera un token JWT con los datos básicos del administrador.
   * - Responde con el token y la información del usuario.
   */
  static googleAdminAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google-admin",
      { session: false },
      (err: Error | null, user: any, info?: any) => {
        if (err) return next(new InternalServerError("Error en autenticación con Google"));
        if (!user) return next(new UnauthorizedError(info?.message || "Autenticación fallida"));

        try {
          const payload = {
            id: user.user_id,
            email: user.email,
            role: user.role,
          };

          const secret = process.env.JWT_SECRET;
          if (!secret) throw new InternalServerError("JWT_SECRET no está definido");

          const token = jwt.sign(payload, secret, { expiresIn: "1h" });

          return res.json({ token, user: payload });
        } catch {
          return next(new InternalServerError("Error al generar token"));
        }
      }
    )(req, res, next);
  }
}
