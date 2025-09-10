import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("GET /api/devices", () => {
  let token: string;
  let tA: any, tB: any;

  beforeEach(async () => {
    token = await getAdminToken();

    tA = (await withAuth(request(app).post("/api/device-types"), token).send({ name: "Laptop", code: "LPT" })).body;
    tB = (await withAuth(request(app).post("/api/device-types"), token).send({ name: "Monitor", code: "MON" })).body;

    await withAuth(request(app).post("/api/devices"), token).send({ name: "PC-01", deviceTypeId: tA.device_type_id });
    await withAuth(request(app).post("/api/devices"), token).send({ name: "PC-02", deviceTypeId: tA.device_type_id });
    await withAuth(request(app).post("/api/devices"), token).send({ name: "MON-01", deviceTypeId: tB.device_type_id });
    await withAuth(request(app).post("/api/devices"), token).send({ name: "ACC-01", deviceTypeId: tB.device_type_id });
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await withAuth(request(app).get("/api/devices?search=pc"), token);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.rows.some((d: any) => /PC-0[12]/.test(d.device_name))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await withAuth(request(app).get("/api/devices?limit=2&offset=0"), token);
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(2);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ orden por name DESC", async () => {
    const res = await withAuth(request(app).get("/api/devices?sort=name&order=DESC&limit=4"), token);
    expect(res.status).toBe(200);
    const names = res.body.rows.map((r: any) => r.device_name);
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  it("✅ filtra por deviceTypeId", async () => {
    const res = await withAuth(request(app).get(`/api/devices?deviceTypeId=${tA.device_type_id}`), token);
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.every((r: any) => r.device_type_id === tA.device_type_id)).toBe(true);
  });
});

describe("GET /api/devices/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ devuelve un dispositivo existente por id", async () => {
    const t = (await withAuth(request(app).post("/api/device-types"), token).send({ name: "Tablet", code: "TAB" })).body;
    const created = await withAuth(request(app).post("/api/devices"), token).send({ name: "TAB-01", deviceTypeId: t.device_type_id });

    const res = await withAuth(request(app).get(`/api/devices/${created.body.device_id}`), token);
    expect(res.status).toBe(200);
    expect(res.body.device_name).toBe("TAB-01");
    expect(res.body.deviceType?.type_name).toBe("Tablet");
  });

  it("❌ 400 si id inválido (no entero)", async () => {
    const res = await withAuth(request(app).get("/api/devices/abc"), token);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await withAuth(request(app).get("/api/devices/9999999"), token);
    expect(res.status).toBe(404);
  });
});
