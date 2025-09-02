import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/error";

export interface JwtUserPayload extends JwtPayload {
  user_id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const auth = req.get("authorization") || req.get("Authorization");
  if (auth) {
    const m = auth.trim().match(/^bearer\s+(.+)$/i);
    if (m?.[1]) return m[1].trim();
  }

  const fromCookie = (req as any).cookies?.access_token || (req as any).cookies?.token;
  if (fromCookie && typeof fromCookie === "string") return fromCookie.trim();
  return undefined;
}

function getVerifyOptions() {
  const opts: jwt.VerifyOptions = {
    algorithms: ["HS256"], 
  };
  if (process.env.JWT_ISSUER) opts.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) opts.audience = process.env.JWT_AUDIENCE;
  return opts;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new UnauthorizedError("Configuración inválida del servidor (JWT_SECRET ausente)."));
  }

  const token = extractToken(req);
  if (!token) {
    return next(new UnauthorizedError("Acceso denegado. No se proporcionó un token."));
  }

  try {
    const decoded = jwt.verify(token, secret, getVerifyOptions()) as JwtUserPayload;
    req.user = decoded;
    return next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expirado."));
    }
    if (err?.name === "NotBeforeError") {
      return next(new UnauthorizedError("Token aún no es válido (nbf)."));
    }
    return next(new UnauthorizedError("Token inválido."));
  }
};


export const requireRoles = (...allowed: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      return next(new UnauthorizedError("No autenticado."));
    }
    if (!allowed.includes(role)) {
      return next(new ForbiddenError("Permisos insuficientes."));
    }
    return next();
  };
};
