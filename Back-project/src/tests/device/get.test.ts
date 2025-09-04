import request from "supertest";
import app from "../../app";

describe("GET /api/devices", () => {
  let tA: any, tB: any;

  beforeEach(async () => {
    tA = (await request(app).post("/api/device-types").send({ name: "Laptop", code: "LPT" })).body;
    tB = (await request(app).post("/api/device-types").send({ name: "Monitor", code: "MON" })).body;

    await request(app).post("/api/devices").send({ name: "PC-01", deviceTypeId: tA.device_type_id });
    await request(app).post("/api/devices").send({ name: "PC-02", deviceTypeId: tA.device_type_id });
    await request(app).post("/api/devices").send({ name: "MON-01", deviceTypeId: tB.device_type_id });
    await request(app).post("/api/devices").send({ name: "ACC-01", deviceTypeId: tB.device_type_id });
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await request(app).get("/api/devices?search=pc");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.rows.some((d: any) => /PC-0[12]/.test(d.device_name))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await request(app).get("/api/devices?limit=2&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(2);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ orden por name DESC", async () => {
    const res = await request(app).get("/api/devices?sort=name&order=DESC&limit=4");
    expect(res.status).toBe(200);
    const names = res.body.rows.map((r: any) => r.device_name);
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  it("✅ filtra por deviceTypeId", async () => {
    const res = await request(app).get(`/api/devices?deviceTypeId=${tA.device_type_id}`);
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.every((r: any) => r.device_type_id === tA.device_type_id)).toBe(true);
  });
});

describe("GET /api/devices/:id", () => {
  it("✅ devuelve un dispositivo existente por id", async () => {
    const t = (await request(app).post("/api/device-types").send({ name: "Tablet", code: "TAB" })).body;
    const created = await request(app).post("/api/devices").send({ name: "TAB-01", deviceTypeId: t.device_type_id });

    const res = await request(app).get(`/api/devices/${created.body.device_id}`);
    expect(res.status).toBe(200);
    expect(res.body.device_name).toBe("TAB-01");
    expect(res.body.deviceType?.type_name).toBe("Tablet");
  });

  it("❌ 400 si id inválido (no entero)", async () => {
    const res = await request(app).get("/api/devices/abc");
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).get("/api/devices/9999999");
    expect(res.status).toBe(404);
  });
});
