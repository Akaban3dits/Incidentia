import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("DELETE /api/devices/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ elimina y responde 204", async () => {
    const t = (await withAuth(request(app).post("/api/device-types"), token).send({ name: "UPS", code: "UPS" })).body;
    const created = await withAuth(request(app).post("/api/devices"), token).send({ name: "UPS-01", deviceTypeId: t.device_type_id });

    const res = await withAuth(request(app).delete(`/api/devices/${created.body.device_id}`), token);
    expect(res.status).toBe(204);
  });

  it("❌ 400 si id inválido", async () => {
    const res = await withAuth(request(app).delete("/api/devices/abc"), token);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await withAuth(request(app).delete("/api/devices/9999999"), token);
    expect(res.status).toBe(404);
  });
});
