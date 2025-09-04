import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../utils/error";

export class AuthController {

  static googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-user", { scope: ["profile", "email"] })(req, res, next);
  }

  static googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google-user",
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

  static googleAdminAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-admin", { scope: ["profile", "email"] })(req, res, next);
  }

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
