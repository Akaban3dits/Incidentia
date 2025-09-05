import request from "supertest";
import app from "../../app";

describe("DELETE /api/device-types/:id", () => {
  it("✅ elimina y responde 204", async () => {
    const created = await request(app).post("/api/device-types").send({ name: "Eliminar", code: "DEL" });
    const res = await request(app).delete(`/api/device-types/${created.body.device_type_id}`);
    expect(res.status).toBe(204);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).delete("/api/device-types/999999");
    expect(res.status).toBe(404);
  });
});
