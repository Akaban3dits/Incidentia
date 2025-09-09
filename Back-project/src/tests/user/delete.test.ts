import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("DELETE /api/users/:userId", () => {
  it("✅ elimina y responde 204", async () => {
    const token = await getAdminToken();

    const created = await withAuth(
      request(app).post("/api/users").send({
        first_name: "Del",
        last_name: "User",
        email: "deluser@example.com",
        password: "secreto123",
      }),
      token
    );

    const res = await withAuth(
      request(app).delete(`/api/users/${created.body.user_id}`),
      token
    );

    expect(res.status).toBe(204);
  });

  it("❌ 400 si userId no es UUID", async () => {
    const token = await getAdminToken();
    const res = await withAuth(
      request(app).delete("/api/users/123"),
      token
    );
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const token = await getAdminToken();
    const res = await withAuth(
      request(app).delete("/api/users/00000000-0000-0000-0000-000000000000"),
      token
    );
    expect(res.status).toBe(404);
  });
});
