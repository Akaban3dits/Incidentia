import request from "supertest";
import app from "../../app";

describe("DELETE /api/departments/:id", () => {
  it("✅ elimina y responde 204", async () => {
    const created = await request(app).post("/api/departments").send({ name: "Temporal DELETE" });
    const res = await request(app).delete(`/api/departments/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).delete("/api/departments/9999999");
    expect(res.status).toBe(404);
  });
});
