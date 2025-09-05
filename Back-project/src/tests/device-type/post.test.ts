import request from "supertest";
import app from "../../app";

describe("POST /api/device-types", () => {
  it("✅ crea un tipo solo con nombre (sin código)", async () => {
    const res = await request(app).post("/api/device-types").send({ name: "Laptop" });
    expect(res.status).toBe(201);
    expect(res.body.type_name).toBe("Laptop");
    expect(res.body.type_code).toBeNull();
  });

  it("✅ crea con código (se normaliza a mayúsculas)", async () => {
    const res = await request(app).post("/api/device-types").send({ name: "Monitor", code: "mon" });
    expect(res.status).toBe(201);
    expect(res.body.type_code).toBe("MON");
  });

  it("❌ 400 si falta name", async () => {
    const res = await request(app).post("/api/device-types").send({ code: "AAA" });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si code inválido (largo)", async () => {
    const res = await request(app).post("/api/device-types").send({ name: "Teclado", code: "ABCD" });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si code inválido (no solo letras)", async () => {
    const res = await request(app).post("/api/device-types").send({ name: "Mouse", code: "A1C" });
    expect(res.status).toBe(400);
  });

  it("❌ 409 si nombre duplicado", async () => {
    await request(app).post("/api/device-types").send({ name: "Duplicado" });
    const res = await request(app).post("/api/device-types").send({ name: "Duplicado" });
    expect(res.status).toBe(409);
  });

  it("❌ 409 si código duplicado", async () => {
    await request(app).post("/api/device-types").send({ name: "Tipo A", code: "AAA" });
    const res = await request(app).post("/api/device-types").send({ name: "Tipo B", code: "AAA" });
    expect(res.status).toBe(409);
  });
});
