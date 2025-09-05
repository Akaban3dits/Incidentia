import request from "supertest";
import app from "../../app";

describe("DELETE /api/devices/:id", () => {
  it("✅ elimina y responde 204", async () => {
    const t = (await request(app).post("/api/device-types").send({ name: "UPS", code: "UPS" })).body;
    const created = await request(app).post("/api/devices").send({ name: "UPS-01", deviceTypeId: t.device_type_id });

    const res = await request(app).delete(`/api/devices/${created.body.device_id}`);
    expect(res.status).toBe(204);
  });

  it("❌ 400 si id inválido", async () => {
    const res = await request(app).delete("/api/devices/abc");
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).delete("/api/devices/9999999");
    expect(res.status).toBe(404);
  });
});
