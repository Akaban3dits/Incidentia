import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from "../utils/error";
import { UserService } from "../services/user.service";

function isProfileComplete(user: any): boolean {
  return Boolean(user.phone_number && user.company && user.department_id);
}

function deriveName(user: any): string | null {
  const fromDB =
    (typeof user.name === "string" && user.name.trim()) ||
    (typeof user.full_name === "string" && user.full_name.trim()) ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const fromGoogle =
    (typeof user.displayName === "string" && user.displayName.trim()) ||
    [user.given_name, user.family_name].filter(Boolean).join(" ").trim() ||
    null;

  const fromEmail =
    typeof user.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]
      : null;

  return fromDB || fromGoogle || fromEmail || null;
}

export class AuthController {
  static googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-user", {
      scope: ["profile", "email"],
      prompt: "consent select_account",
    })(req, res, next);
  }

  static googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "google-user",
      { session: false },
      (err: Error | null, user: any, info?: any) => {
        if (err)
          return next(
            new InternalServerError("Error en autenticación con Google")
          );
        if (!user)
          return next(
            new UnauthorizedError(info?.message || "Autenticación fallida")
          );

        try {
          const payload = {
            id: user.user_id,
            name: deriveName(user),
            email: user.email,
            role: user.role,
            isCompleteProfile: isProfileComplete(user),
          };

          const secret = process.env.JWT_SECRET;
          if (!secret)
            throw new InternalServerError("JWT_SECRET no está definido");

          const token = jwt.sign(payload, secret, { expiresIn: "1h" });
          return res.json({ token, user: payload });
        } catch {
          return next(new InternalServerError("Error al generar token"));
        }
      }
    )(req, res, next);
  }

  static googleAdminAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google-admin", {
      scope: ["profile", "email"],
      prompt: "consent select_account",
    })(req, res, next);
  }

  static googleAdminAuthCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    passport.authenticate(
      "google-admin",
      { session: false },
      (err: Error | null, user: any, info?: any) => {
        if (err)
          return next(
            new InternalServerError("Error en autenticación con Google")
          );
        if (!user)
          return next(
            new UnauthorizedError(info?.message || "Autenticación fallida")
          );

        try {
          const payload = {
            id: user.user_id,
            name: deriveName(user),
            email: user.email,
            role: user.role,
            isCompleteProfile: isProfileComplete(user),
          };

          const secret = process.env.JWT_SECRET;
          if (!secret)
            throw new InternalServerError("JWT_SECRET no está definido");

          const token = jwt.sign(payload, secret, { expiresIn: "1h" });
          return res.json({ token, user: payload });
        } catch {
          return next(new InternalServerError("Error al generar token"));
        }
      }
    )(req, res, next);
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new BadRequestError("Email y contraseña son requeridos.");

      const user = await UserService.findByEmailWithPassword(email);

      if (!user.password)
        throw new UnauthorizedError(
          "El usuario no tiene contraseña configurada."
        );

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedError("Credenciales inválidas.");

      const payload = {
        id: user.user_id,
        name: deriveName(user),
        email: user.email,
        role: user.role,
        isCompleteProfile: isProfileComplete(user),
      };

      const secret = process.env.JWT_SECRET;
      if (!secret)
        throw new InternalServerError("JWT_SECRET no está definido");

      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      return res.json({ token, user: payload });
    } catch (err) {
      return next(err);
    }
  }
}
