import request from "supertest";
import app from "../../app";

describe("PUT /api/departments/:id", () => {
  it("✅ actualiza el nombre", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Soporte" });
    const res = await request(app)
      .put(`/api/departments/${created.body.id}`)
      .send({ name: "Soporte Técnico" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Soporte Técnico");
  });

  it("❌ 409 si el nuevo nombre ya existe", async () => {
    const a = await request(app).post("/api/departments").send({ name: "Ventas" });
    await request(app).post("/api/departments").send({ name: "Compras" });

    const res = await request(app)
      .put(`/api/departments/${a.body.id}`)
      .send({ name: "Compras" });

    expect(res.status).toBe(409);
  });

  it("❌ 400 si el nombre es vacío", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Temporal PUT" });
    const res = await request(app)
      .put(`/api/departments/${created.body.id}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("❌ 400 si el nombre es solo números", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Temporal Números" });
    const res = await request(app)
      .put(`/api/departments/${created.body.id}`)
      .send({ name: "12345" });

    expect(res.status).toBe(400);
  });

  it("❌ 400 si excede 100 caracteres", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Temporal Largo" });
    const longName = "A".repeat(101);
    const res = await request(app)
      .put(`/api/departments/${created.body.id}`)
      .send({ name: longName });

    expect(res.status).toBe(400);
  });
});
