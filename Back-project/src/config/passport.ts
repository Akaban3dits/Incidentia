import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserService } from "../services/user.service";
import { UserRole } from "../enums/userRole.enum";

// Serializa y deserializa usuarios para la sesión (basado en user_id)
passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});
passport.deserializeUser(async (id: string, done) => {
  const user = await UserService.findById(id);
  done(null, user);
});

const callbackBaseUrl = process.env.GOOGLE_CALLBACK_BASE_URL;

// Estrategia para usuarios normales
passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${callbackBaseUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await UserService.findOrCreateGoogleUser(profile);
      done(null, user); // Autenticación exitosa
    }
  )
);

// Estrategia para crear un único administrador
passport.use(
  "google-admin",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${callbackBaseUrl}/api/auth/google/admin/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingAdmin = await UserService.findOneByRole(UserRole.Administrador);
      if (existingAdmin) {
        // No permite crear otro admin si ya existe uno
        return done(null, false, { message: "Ya existe un administrador." });
      }
      const adminUser = await UserService.createAdminFromGoogleProfile(profile);
      done(null, adminUser);
    }
  )
);

export default passport;
