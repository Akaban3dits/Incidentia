import request from "supertest";
import app from "../../app";
import User from "../../models/user.model";
import bcrypt from "bcrypt";
import { UserRole } from "../../enums/userRole.enum";
import { UserStatus } from "../../enums/userStatus.enum";

describe("POST /api/auth/login", () => {
  const validEmail = "testuser@example.com";
  const validPassword = "MyPassword123";
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await bcrypt.hash(validPassword, 10);
    await User.create({
      first_name: "Test",
      last_name: "User",
      email: validEmail,
      password: hashedPassword,
      role: UserRole.Estandar,
      status: UserStatus.Activo,
    });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: validEmail } });
  });

  it("✅ debería loguear exitosamente con credenciales válidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validEmail, password: validPassword })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", validEmail);
    expect(res.body.user).toHaveProperty("isCompleteProfile");
  });

  it("❌ debería fallar si falta el email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: validPassword })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si falta la contraseña", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validEmail })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si el email no es válido", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: validPassword })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si la contraseña es incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validEmail, password: "WrongPassword!" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/credenciales inválidas/i);
  });

  it("❌ debería fallar si el usuario no existe", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexist@example.com", password: "SomePassword123" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/usuario no encontrado/i);
  });
});
