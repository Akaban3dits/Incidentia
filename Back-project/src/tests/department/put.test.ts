import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("PUT /api/departments/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ actualiza el nombre", async () => {
    const created = await withAuth(request(app).post("/api/departments"), token).send({ name: "Soporte" });
    const res = await withAuth(request(app).put(`/api/departments/${created.body.id}`), token)
      .send({ name: "Soporte Técnico" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Soporte Técnico");
  });

  it("❌ 409 si el nuevo nombre ya existe", async () => {
    const a = await withAuth(request(app).post("/api/departments"), token).send({ name: "Ventas" });
    await withAuth(request(app).post("/api/departments"), token).send({ name: "Compras" });

    const res = await withAuth(request(app).put(`/api/departments/${a.body.id}`), token)
      .send({ name: "Compras" });

    expect(res.status).toBe(409);
  });

  it("❌ 400 si el nombre es vacío", async () => {
    const created = await withAuth(request(app).post("/api/departments"), token).send({ name: "Temporal PUT" });
    const res = await withAuth(request(app).put(`/api/departments/${created.body.id}`), token)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("❌ 400 si el nombre es solo números", async () => {
    const created = await withAuth(request(app).post("/api/departments"), token).send({ name: "Temporal Números" });
    const res = await withAuth(request(app).put(`/api/departments/${created.body.id}`), token)
      .send({ name: "12345" });

    expect(res.status).toBe(400);
  });

  it("❌ 400 si excede 100 caracteres", async () => {
    const created = await withAuth(request(app).post("/api/departments"), token).send({ name: "Temporal Largo" });
    const longName = "A".repeat(101);
    const res = await withAuth(request(app).put(`/api/departments/${created.body.id}`), token)
      .send({ name: longName });

    expect(res.status).toBe(400);
  });
});
