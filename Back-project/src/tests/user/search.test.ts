import request from "supertest";
import app from "../../app";
import { getAdminToken, withAuth } from "../auth/token";

describe("GET /api/users (search/list)", () => {
  let depSoporteId: number;
  let depOperacionesId: number;
  let token: string;

  beforeEach(async () => {
    token = await getAdminToken();

    const dep1 = await withAuth(
      request(app).post("/api/departments").send({ name: "Soporte" }),
      token
    );
    depSoporteId = dep1.body.id;

    const dep2 = await withAuth(
      request(app).post("/api/departments").send({ name: "Operaciones" }),
      token
    );
    depOperacionesId = dep2.body.id;

    await withAuth(
      request(app).post("/api/users").send({
        first_name: "Carlos",
        last_name: "Gomez",
        email: "carlos@example.com",
        password: "secreto123",
        phone_number: "+521234567890",
      }),
      token
    );

    const u2 = await withAuth(
      request(app).post("/api/users").send({
        first_name: "Lucia",
        last_name: "Mendez",
        email: "lucia@example.com",
        password: "secreto123",
      }),
      token
    );
    await withAuth(
      request(app).put(`/api/users/${u2.body.user_id}/profile`).send({
        department_id: depSoporteId,
      }),
      token
    );

    const u3 = await withAuth(
      request(app).post("/api/users").send({
        first_name: "Luis",
        last_name: "Perez",
        email: "luis@example.com",
        password: "secreto123",
      }),
      token
    );
    await withAuth(
      request(app).put(`/api/users/${u3.body.user_id}/profile`).send({
        department_id: depOperacionesId,
      }),
      token
    );
  });

  it("✅ filtra por q (busca por nombre/apellido/email)", async () => {
    const res = await withAuth(request(app).get("/api/users?q=luc"), token);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((u: any) => /lucia/i.test(u.first_name))).toBe(true);
  });

  it("✅ filtra por department_id", async () => {
    const res = await withAuth(
      request(app).get(`/api/users?department_id=${depSoporteId}`),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.rows.every((u: any) => u.department_id === depSoporteId)).toBe(true);
  });

  it("✅ respeta paginación (page/pageSize)", async () => {
    const res = await withAuth(
      request(app).get("/api/users?page=1&pageSize=2"),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeLessThanOrEqual(2);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ recent=true ordena por createdAt DESC (al menos no rompe)", async () => {
    const res = await withAuth(request(app).get("/api/users?recent=true"), token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rows)).toBe(true);
  });
});
