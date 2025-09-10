import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("POST /api/devices", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  const makeType = async (name = "Laptop", code = "LPT") => {
    const r = await withAuth(request(app).post("/api/device-types"), token).send({ name, code });
    return r.body;
  };

  it("✅ crea un dispositivo válido", async () => {
    const t = await makeType();
    const res = await withAuth(request(app).post("/api/devices"), token).send({
      name: "PC-01",
      deviceTypeId: t.device_type_id,
    });

    expect(res.status).toBe(201);
    expect(res.body.device_name).toBe("PC-01");
    expect(res.body.device_type_id).toBe(t.device_type_id);
    expect(res.body.deviceType?.type_name).toBe("Laptop"); 
  });

  it("❌ 400 si falta name", async () => {
    const t = await makeType("Monitor", "MON");
    const res = await withAuth(request(app).post("/api/devices"), token).send({
      deviceTypeId: t.device_type_id,
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si name muy corto", async () => {
    const t = await makeType("Impresora", "IMP");
    const res = await withAuth(request(app).post("/api/devices"), token).send({
      name: "A",
      deviceTypeId: t.device_type_id,
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si falta deviceTypeId", async () => {
    const res = await withAuth(request(app).post("/api/devices"), token).send({
      name: "PC-02",
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si deviceTypeId no existe (FK inválida)", async () => {
    const res = await withAuth(request(app).post("/api/devices"), token).send({
      name: "PC-03",
      deviceTypeId: 9999999,
    });
    expect(res.status).toBe(400);
  });

  it("❌ 409 si nombre duplicado (único global)", async () => {
    const t1 = await makeType("Tipo A", "AAA");
    const t2 = await makeType("Tipo B", "BBB");

    await withAuth(request(app).post("/api/devices"), token).send({ name: "UNICO", deviceTypeId: t1.device_type_id });
    const res = await withAuth(request(app).post("/api/devices"), token).send({ name: "UNICO", deviceTypeId: t2.device_type_id });
    expect(res.status).toBe(409);
  });
});
