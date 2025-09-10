import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("DELETE /api/device-types/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ elimina y responde 204", async () => {
    const created = await withAuth(request(app).post("/api/device-types"), token)
      .send({ name: "Eliminar", code: "DEL" });
    const res = await withAuth(
      request(app).delete(`/api/device-types/${created.body.device_type_id}`),
      token
    );
    expect(res.status).toBe(204);
  });

  it("❌ 404 si no existe", async () => {
    const res = await withAuth(request(app).delete("/api/device-types/999999"), token);
    expect(res.status).toBe(404);
  });
});
