import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/error";

export interface JwtUserPayload extends JwtPayload {
  user_id?: string; // puede no venir; mapeamos abajo
  email?: string;
  name?: string;
  role?: string;
}

declare global {
  namespace Express {
    // Extend the existing user property type to include JwtUserPayload
    // This makes Request['user'] compatible with both JwtUserPayload and the default User type
    interface User extends JwtUserPayload {}
  }
}

function extractToken(req: Request): string | undefined {
  const auth = req.get("authorization") || req.get("Authorization");
  if (auth) {
    const m = auth.trim().match(/^bearer\s+(.+)$/i);
    if (m?.[1]) return m[1].trim();
  }
  const fromCookie = (req as any).cookies?.access_token || (req as any).cookies?.token;
  if (typeof fromCookie === "string") return fromCookie.trim();
  return undefined;
}

function getVerifyOptions(): jwt.VerifyOptions {
  const opts: jwt.VerifyOptions = { algorithms: ["HS256"] };
  if (process.env.JWT_ISSUER) opts.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) opts.audience = process.env.JWT_AUDIENCE;
  return opts;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new UnauthorizedError("JWT_SECRET ausente."));

  const token = extractToken(req);
  console.log("[auth] Authorization:", req.get("authorization"));
  console.log("[auth] token en cookie?:", Boolean((req as any).cookies?.access_token || (req as any).cookies?.token));

  if (!token) return next(new UnauthorizedError("No se proporcionó token."));

  try {
    const decoded = jwt.verify(token, secret, getVerifyOptions()) as JwtUserPayload & { sub?: string; id?: string };
    // Mapeo robusto a user_id
    const user_id = decoded.user_id ?? decoded.id ?? decoded.sub;
    if (!user_id) return next(new UnauthorizedError("Token sin user_id/sub."));
    req.user = { ...decoded, user_id };

    console.log("[auth] OK user_id:", req.user.user_id);
    return next();
  } catch (err: any) {
    console.error("[auth] inválido:", err?.name, err?.message);
    if (err?.name === "TokenExpiredError") return next(new UnauthorizedError("Token expirado."));
    if (err?.name === "NotBeforeError") return next(new UnauthorizedError("Token aún no es válido (nbf)."));
    return next(new UnauthorizedError("Token inválido."));
  }
};

export const requireRoles = (...allowed: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return next(new UnauthorizedError("No autenticado."));
    if (!allowed.includes(role)) return next(new ForbiddenError("Permisos insuficientes."));
    return next();
  };
};
