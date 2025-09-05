import request from "supertest";
import app from "../../app";

describe("PUT /api/devices/:id", () => {
  const makeType = async (name: string, code: string) =>
    (await request(app).post("/api/device-types").send({ name, code })).body;

  it("✅ actualiza nombre y tipo", async () => {
    const t1 = await makeType("Servidor", "SRV");
    const t2 = await makeType("Impresora", "IMP");

    const created = await request(app).post("/api/devices").send({
      name: "SRV-01",
      deviceTypeId: t1.device_type_id,
    });

    const res = await request(app)
      .put(`/api/devices/${created.body.device_id}`)
      .send({ name: "SRV-01-MOD", deviceTypeId: t2.device_type_id });

    expect(res.status).toBe(200);
    expect(res.body.device_name).toBe("SRV-01-MOD");
    expect(res.body.device_type_id).toBe(t2.device_type_id);
    expect(res.body.deviceType?.type_name).toBe("Impresora");
  });

  it("❌ 409 si intenta renombrar a un nombre existente", async () => {
    const t = await makeType("Tipo", "TIP");
    const a = await request(app).post("/api/devices").send({ name: "D-A", deviceTypeId: t.device_type_id });
    await request(app).post("/api/devices").send({ name: "D-B", deviceTypeId: t.device_type_id });

    const res = await request(app).put(`/api/devices/${a.body.device_id}`).send({ name: "D-B" });
    expect(res.status).toBe(409);
  });

  it("❌ 400 si name inválido", async () => {
    const t = await makeType("Cámara", "CAM");
    const a = await request(app).post("/api/devices").send({ name: "CAM-01", deviceTypeId: t.device_type_id });

    const res = await request(app).put(`/api/devices/${a.body.device_id}`).send({ name: "C" });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si deviceTypeId no existe", async () => {
    const t = await makeType("Router", "RTR");
    const a = await request(app).post("/api/devices").send({ name: "RTR-01", deviceTypeId: t.device_type_id });

    const res = await request(app).put(`/api/devices/${a.body.device_id}`).send({ deviceTypeId: 9999999 });
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe el dispositivo", async () => {
    const res = await request(app).put("/api/devices/9999999").send({ name: "OK" });
    expect(res.status).toBe(404);
  });
});
