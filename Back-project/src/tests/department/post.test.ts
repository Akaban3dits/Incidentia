import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("POST /api/departments", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ debería crear un departamento válido", async () => {
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "Calidad" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Calidad");
  });

  it("❌ debería fallar si falta el campo name", async () => {
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({})
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si el nombre está vacío", async () => {
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si el nombre excede 100 caracteres", async () => {
    const longName = "A".repeat(101);
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: longName })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("❌ debería fallar si el nombre es solo números", async () => {
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "12345" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("✅ debería permitir nombre con letras y números mezclados", async () => {
    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "Sistemas 2" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Sistemas 2");
  });

  it("❌ debería fallar si el nombre ya existe (duplicado)", async () => {
    await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "Duplicado" })
      .set("Content-Type", "application/json");

    const res = await withAuth(request(app).post("/api/departments"), token)
      .send({ name: "Duplicado" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya existe/i);
  });
});
