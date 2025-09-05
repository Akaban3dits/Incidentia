import request from "supertest";
import app from "../../app";

describe("DELETE /api/users/:userId", () => {
  it("✅ elimina y responde 204", async () => {
    const created = await request(app).post("/api/users").send({
      first_name: "Del",
      last_name: "User",
      email: "deluser@example.com",
      password: "secreto123",
    });
    const res = await request(app).delete(`/api/users/${created.body.user_id}`);
    expect(res.status).toBe(204);
  });

  it("❌ 400 si userId no es UUID", async () => {
    const res = await request(app).delete("/api/users/123");
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).delete("/api/users/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

});
