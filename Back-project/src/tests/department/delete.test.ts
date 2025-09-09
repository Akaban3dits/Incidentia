import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("DELETE /api/departments/:id", () => {
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  it("✅ elimina y responde 204", async () => {
    const created = await withAuth(request(app).post("/api/departments"), token).send({ name: "Temporal DELETE" });
    const res = await withAuth(request(app).delete(`/api/departments/${created.body.id}`), token);
    expect(res.status).toBe(204);
  });

  it("❌ 404 si no existe", async () => {
    const res = await withAuth(request(app).delete("/api/departments/9999999"), token);
    expect(res.status).toBe(404);
  });
});
