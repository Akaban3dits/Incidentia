import request from "supertest";
import app from "../../app";

describe("GET /api/departments", () => {
  beforeEach(async () => {
    await request(app).post("/api/departments").send({ name: "Sistemas" });
    await request(app).post("/api/departments").send({ name: "Calidad" });
    await request(app).post("/api/departments").send({ name: "Operaciones 2" });
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await request(app).get("/api/departments?search=sis");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((r: any) => /sistemas/i.test(r.name))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await request(app).get("/api/departments?limit=1&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(1);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ respeta sort y order (name DESC)", async () => {
    const res = await request(app).get("/api/departments?sort=name&order=DESC&limit=50");
    expect(res.status).toBe(200);
    const names: string[] = res.body.rows.map((r: any) => r.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "es")).reverse();
    expect(names).toEqual(sorted);
  });
});


describe("GET /api/departments/:id", () => {
  it("✅ devuelve un departamento existente por id", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Atención al Cliente" });
    const res = await request(app).get(`/api/departments/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Atención al Cliente");
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).get("/api/departments/9999999");
    expect(res.status).toBe(404);
  });
});
