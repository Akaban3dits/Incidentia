import request from "supertest";
import app from "../../app";

describe("PUT /api/users/:userId/profile", () => {
  it("✅ actualiza teléfono y departamento", async () => {
    const dep = await request(app).post("/api/departments").send({ name: "Sistemas" });

    const created = await request(app).post("/api/users").send({
      first_name: "Lia",
      last_name: "Kim",
      email: "lia@example.com",
      password: "secreto123",
    });

    const res = await request(app)
      .put(`/api/users/${created.body.user_id}/profile`)
      .send({
        phone_number: "+52 (999) 111-2233",
        department_id: dep.body.id,
      });

    expect(res.status).toBe(200);
    expect(res.body.phone_number).toBe("+529991112233"); 
    expect(res.body.department_id).toBe(dep.body.id);
    expect(res.body).not.toHaveProperty("password");
  });

  it("✅ permite limpiar department_id con null", async () => {
    const dep = await request(app).post("/api/departments").send({ name: "Calidad" });
    const u = await request(app).post("/api/users").send({
      first_name: "Ana",
      last_name: "Doe",
      email: "ana.doe@example.com",
      password: "secreto123",
    });

    await request(app).put(`/api/users/${u.body.user_id}/profile`).send({
      department_id: dep.body.id,
    });

    const res = await request(app).put(`/api/users/${u.body.user_id}/profile`).send({
      department_id: null,
    });

    expect(res.status).toBe(200);
    expect(res.body.department_id).toBeNull();
  });

  it("❌ 400 si phone_number inválido", async () => {
    const u = await request(app).post("/api/users").send({
      first_name: "Bad",
      last_name: "Phone",
      email: "badphone@example.com",
      password: "secreto123",
    });

    const res = await request(app)
      .put(`/api/users/${u.body.user_id}/profile`)
      .send({ phone_number: "abc-xyz" });

    expect(res.status).toBe(400);
  });

  it("❌ 404 si department_id no existe", async () => {
    const u = await request(app).post("/api/users").send({
      first_name: "NoDep",
      last_name: "User",
      email: "nodep@example.com",
      password: "secreto123",
    });

    const res = await request(app)
      .put(`/api/users/${u.body.user_id}/profile`)
      .send({ department_id: 9999999 });

    expect(res.status).toBe(404);
  });

  it("❌ 409 si phone_number duplicado", async () => {
    const u1 = await request(app).post("/api/users").send({
      first_name: "P1",
      last_name: "L1",
      email: "p1@example.com",
      password: "secreto123",
      phone_number: "+52 111 222 3333",
    });
    const u2 = await request(app).post("/api/users").send({
      first_name: "P2",
      last_name: "L2",
      email: "p2@example.com",
      password: "secreto123",
    });

    const res = await request(app)
      .put(`/api/users/${u2.body.user_id}/profile`)
      .send({ phone_number: "+521112223333" });

    expect(res.status).toBe(409);
  });

  it("✅ actualiza password (respuesta no expone password)", async () => {
    const u = await request(app).post("/api/users").send({
      first_name: "Sec",
      last_name: "Pass",
      email: "secpass@example.com",
      password: "secreto123",
    });

    const res = await request(app)
      .put(`/api/users/${u.body.user_id}/profile`)
      .send({ password: "otroPass456" });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });
});
