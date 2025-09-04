import request from "supertest";
import app from "../../app";

describe("GET /api/device-types", () => {
  beforeEach(async () => {
    await request(app).post("/api/device-types").send({ name: "Tipo A", code: "AAA" });
    await request(app).post("/api/device-types").send({ name: "Tipo C", code: "CCC" });
    await request(app).post("/api/device-types").send({ name: "Tipo B", code: "BBB" });
    await request(app).post("/api/device-types").send({ name: "Accesorios" }); 
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await request(app).get("/api/device-types?search=ceso");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((r: any) => r.type_name === "Accesorios")).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await request(app).get("/api/device-types?limit=2&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(2);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ orden por code DESC", async () => {
    const res = await request(app).get("/api/device-types?sort=code&order=DESC&limit=3");
    expect(res.status).toBe(200);
    const codes = res.body.rows.map((r: any) => r.type_code); 
    const nonNull = codes.filter((c: string | null) => c !== null) as string[];
    const sorted = [...nonNull].sort().reverse();
    expect(nonNull).toEqual(sorted);
  });
});

describe("GET /api/device-types/:id", () => {
  it("✅ devuelve un tipo existente por id", async () => {
    const created = await request(app).post("/api/device-types").send({ name: "Impresora", code: "IMP" });
    const res = await request(app).get(`/api/device-types/${created.body.device_type_id}`);
    expect(res.status).toBe(200);
    expect(res.body.type_name).toBe("Impresora");
    expect(res.body.type_code).toBe("IMP");
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).get("/api/device-types/9999999");
    expect(res.status).toBe(404);
  });

  it("❌ 400 si id inválido (no entero)", async () => {
    const res = await request(app).get("/api/device-types/abc");
    expect(res.status).toBe(400);
  });
});
