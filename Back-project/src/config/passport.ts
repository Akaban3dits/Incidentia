import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
  return {
    id: profile.id,
    emails: (profile.emails || []).map((e) => ({ value: e.value })),
    name: {
      givenName: profile.name?.givenName || "",
      familyName: profile.name?.familyName || "",
    },
  };
}

export function configurePassport() {
  const clientID = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const callbackBaseUrl = getEnv("GOOGLE_CALLBACK_BASE_URL");

  // Serialización por user_id
  passport.serializeUser((user: any, done) => {
    try {
      done(null, user.user_id);
    } catch (err) {
      done(err as any);
    }
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserService.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err as any);
    }
  });

  // Estrategia: Usuarios estándar
  passport.use(
    "google-user",
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: joinUrl(callbackBaseUrl, "/api/auth/google/callback"),
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const gp = toGoogleProfile(profile);
          const user = await UserService.findOrCreateGoogleUser(gp);
          return done(null, user);
        } catch (err) {
          return done(new InternalServerError("Error en login con Google."));
        }
      }
    )
  );

  // Estrategia: ÚNICO Administrador
  passport.use(
    "google-admin",
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: joinUrl(callbackBaseUrl, "/api/auth/google/admin/callback"),
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const existingAdmin = await UserService.findOneByRole(UserRole.Administrador);
          if (existingAdmin) {
            return done(null, false, { message: "Ya existe un administrador." });
          }
          const gp = toGoogleProfile(profile);
          const adminUser = await UserService.createAdminFromGoogleProfile(gp);
          return done(null, adminUser);
        } catch (err) {
          return done(new InternalServerError("Error al crear admin con Google."));
        }
      }
    )
  );

  return passport;
}

export default passport;
