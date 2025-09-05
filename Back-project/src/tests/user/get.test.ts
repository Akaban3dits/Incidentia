import request from "supertest";
import app from "../../app";

describe("GET /api/users/:userId", () => {
  it("✅ devuelve usuario existente por id", async () => {
    const created = await request(app).post("/api/users").send({
      first_name: "Mario",
      last_name: "Rossi",
      email: "mario@example.com",
      password: "secreto123",
    });

    const id = created.body.user_id;
    const res = await request(app).get(`/api/users/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("mario@example.com");
    expect(res.body).not.toHaveProperty("password");
  });

  it("❌ 400 si userId no es UUID", async () => {
    const res = await request(app).get("/api/users/not-a-uuid");
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).get("/api/users/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });
});
