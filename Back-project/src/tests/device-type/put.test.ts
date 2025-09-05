import request from "supertest";
import app from "../../app";

describe("PUT /api/device-types/:id", () => {
  it("✅ actualiza nombre y código", async () => {
    const created = await request(app).post("/api/device-types").send({ name: "Base", code: "BAS" });
    const res = await request(app)
      .put(`/api/device-types/${created.body.device_type_id}`)
      .send({ name: "Base Mod", code: "xyz" });

    expect(res.status).toBe(200);
    expect(res.body.type_name).toBe("Base Mod");
    expect(res.body.type_code).toBe("XYZ"); 
  });

  it("❌ 409 si actualiza a nombre duplicado", async () => {
    const a = await request(app).post("/api/device-types").send({ name: "Uno", code: "UNO" });
    await request(app).post("/api/device-types").send({ name: "Dos", code: "DOS" });

    const res = await request(app)
      .put(`/api/device-types/${a.body.device_type_id}`)
      .send({ name: "Dos" });

    expect(res.status).toBe(409);
  });

  it("❌ 409 si actualiza a código duplicado", async () => {
    const a = await request(app).post("/api/device-types").send({ name: "A", code: "AAA" });
    const b = await request(app).post("/api/device-types").send({ name: "B", code: "BBB" });

    const res = await request(app)
      .put(`/api/device-types/${a.body.device_type_id}`)
      .send({ code: "BBB" });

    expect(res.status).toBe(409);
  });

  it("✅ permite limpiar el código (null)", async () => {
    const created = await request(app).post("/api/device-types").send({ name: "Temporal", code: "TMP" });
    const res = await request(app)
      .put(`/api/device-types/${created.body.device_type_id}`)
      .send({ code: null });

    expect(res.status).toBe(200);
    expect(res.body.type_code).toBeNull();
  });

  it("❌ 400 si code inválido", async () => {
    const created = await request(app).post("/api/device-types").send({ name: "X", code: "ABC" });
    const res = await request(app)
      .put(`/api/device-types/${created.body.device_type_id}`)
      .send({ code: "AB" });

    expect(res.status).toBe(400);
  });
});
