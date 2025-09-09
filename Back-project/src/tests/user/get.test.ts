import request from "supertest";
import app from "../../app";
import { getAdminToken, getToken, withAuth } from "../auth/token";

describe("GET /api/users/:userId", () => {
  it("✅ devuelve usuario existente por id", async () => {
    const token = await getAdminToken(); 

    const resCreate = await withAuth(
      request(app).post("/api/users").send({
        first_name: "Mario",
        last_name: "Rossi",
        email: "mario@example.com",
        password: "secreto123",
      }),
      token
    );

    const id = resCreate.body.user_id;

    // obtener por ID
    const res = await withAuth(request(app).get(`/api/users/${id}`), token);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("mario@example.com");
    expect(res.body).not.toHaveProperty("password");
  });

  it("❌ 400 si userId no es UUID", async () => {
    const token = await getAdminToken();
    const res = await withAuth(request(app).get("/api/users/not-a-uuid"), token);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const token = await getAdminToken();
    const res = await withAuth(
      request(app).get("/api/users/00000000-0000-0000-0000-000000000000"),
      token
    );
    expect(res.status).toBe(404);
  });
});
