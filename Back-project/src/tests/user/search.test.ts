import request from "supertest";
import app from "../../app";

describe("GET /api/users (search/list)", () => {
  beforeEach(async () => {
    const dep1 = await request(app).post("/api/departments").send({ name: "Soporte" });
    const dep2 = await request(app).post("/api/departments").send({ name: "Operaciones" });

    await request(app).post("/api/users").send({
      first_name: "Carlos",
      last_name: "Gomez",
      email: "carlos@example.com",
      password: "secreto123",
      phone_number: "+521234567890",
    });

    const u2 = await request(app).post("/api/users").send({
      first_name: "Lucia",
      last_name: "Mendez",
      email: "lucia@example.com",
      password: "secreto123",
    });
    await request(app).put(`/api/users/${u2.body.user_id}/profile`).send({
      department_id: dep1.body.id,
    });

    const u3 = await request(app).post("/api/users").send({
      first_name: "Luis",
      last_name: "Perez",
      email: "luis@example.com",
      password: "secreto123",
    });
    await request(app).put(`/api/users/${u3.body.user_id}/profile`).send({
      department_id: dep2.body.id,
    });
  });

  it("✅ filtra por q (busca por nombre/apellido/email)", async () => {
    const res = await request(app).get("/api/users?q=luc");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((u: any) => /lucia/i.test(u.first_name))).toBe(true);
  });

  it("✅ filtra por department_id", async () => {
    const deps = await request(app).get("/api/departments?search=Soporte");
    const depId = deps.body.rows[0].id;

    const res = await request(app).get(`/api/users?department_id=${depId}`);
    expect(res.status).toBe(200);
    expect(res.body.rows.every((u: any) => u.department_id === depId)).toBe(true);
  });

  it("✅ respeta paginación (page/pageSize)", async () => {
    const res = await request(app).get("/api/users?page=1&pageSize=2");
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeLessThanOrEqual(2);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ recent=true ordena por createdAt DESC (al menos no rompe)", async () => {
    const res = await request(app).get("/api/users?recent=true");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rows)).toBe(true);
  });
});
