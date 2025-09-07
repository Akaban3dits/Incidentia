import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { UserService } from "../services/user.service";
import { UserRole } from "../enums/userRole.enum";
import { BadRequestError, InternalServerError } from "../utils/error";
import type { GoogleProfile } from "../types/user.types";

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new BadRequestError(`Falta variable de entorno: ${key}`);
  return v;
}

function joinUrl(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function toGoogleProfile(profile: Profile): GoogleProfile {
  const emails = (profile.emails || []).map((e) => ({ value: e.value }));
  return {
    id: profile.id,
    emails,
    name: {
      givenName: profile.name?.givenName || "",
      familyName: profile.name?.familyName || "",
    },
  };
}

function getPrimaryEmail(profile: Profile): string | null {
  const emails = profile.emails || [];
  if (!emails.length) return null;
  const verified = emails.find((e: any) => (e as any).verified);
  return (verified?.value || emails[0]?.value || null) ?? null;
}

export function configurePassport() {
  const clientID = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const callbackBaseUrl = getEnv("GOOGLE_CALLBACK_BASE_URL");

  const ADMIN_EMAIL_DOMAIN = (process.env.ADMIN_EMAIL_DOMAIN || "").toLowerCase().trim();

  const COMMON_STRATEGY_OPTIONS = {
    clientID,
    clientSecret,
    scope: ["profile", "email"],
    prompt: "select_account" as const,
  };

  passport.use(
    "google-user",
    new GoogleStrategy(
      {
        ...COMMON_STRATEGY_OPTIONS,
        callbackURL: joinUrl(callbackBaseUrl, "/api/auth/google/callback"),
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const email = getPrimaryEmail(profile);
          if (!email) {
            return done(null, false, { message: "Tu cuenta de Google no tiene un email disponible." });
          }

          const user = await UserService.findOrCreateGoogleUser(toGoogleProfile(profile));
          return done(null, user);
        } catch (err) {
          console.error("[google-user] Error:", err);
          return done(new InternalServerError("Error en login con Google."));
        }
      }
    )
  );

  passport.use(
    "google-admin",
    new GoogleStrategy(
      {
        ...COMMON_STRATEGY_OPTIONS,
        callbackURL: joinUrl(callbackBaseUrl, "/api/auth/google/admin/callback"),
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const existingAdmin = await UserService.findOneByRole(UserRole.Administrador);
          if (existingAdmin) {
            return done(null, false, { message: "Ya existe un administrador." });
          }

          const email = getPrimaryEmail(profile);
          if (!email) {
            return done(null, false, { message: "Tu cuenta de Google no tiene un email disponible." });
          }
          if (ADMIN_EMAIL_DOMAIN) {
            const domain = email.split("@")[1]?.toLowerCase();
            if (domain !== ADMIN_EMAIL_DOMAIN) {
              return done(null, false, { message: `El admin debe pertenecer al dominio ${ADMIN_EMAIL_DOMAIN}.` });
            }
          }

          const adminUser = await UserService.createAdminFromGoogleProfile(toGoogleProfile(profile));
          return done(null, adminUser);
        } catch (err) {
          console.error("[google-admin] Error:", err);
          return done(new InternalServerError("Error al crear admin con Google."));
        }
      }
    )
  );

  return passport;
}

export default passport;
