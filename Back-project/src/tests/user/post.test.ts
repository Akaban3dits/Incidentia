import request from "supertest";
import app from "../../app";

describe("POST /api/users", () => {
  it("✅ crea usuario válido (oculta password)", async () => {
    const res = await request(app).post("/api/users").send({
      first_name: "Ana",
      last_name: "López",
      email: "ANA@example.com",
      password: "secreto123",
      phone_number: "+52 123 456 7890"
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user_id");
    expect(res.body.email).toBe("ana@example.com");
    expect(res.body).not.toHaveProperty("password"); 
  });

  it("❌ 400 si falta first_name", async () => {
    const res = await request(app).post("/api/users").send({
      last_name: "Test",
      email: "x@example.com",
      password: "secreto123",
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si email inválido", async () => {
    const res = await request(app).post("/api/users").send({
      first_name: "A",
      last_name: "B",
      email: "no-es-email",
      password: "secreto123",
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si password muy corta", async () => {
    const res = await request(app).post("/api/users").send({
      first_name: "A",
      last_name: "B",
      email: "c@example.com",
      password: "123",
    });
    expect(res.status).toBe(400);
  });

  it("❌ 409 si email duplicado", async () => {
    await request(app).post("/api/users").send({
      first_name: "A",
      last_name: "B",
      email: "dup@example.com",
      password: "secreto123",
    });
    const res = await request(app).post("/api/users").send({
      first_name: "C",
      last_name: "D",
      email: "DUP@example.com",
      password: "secreto123",
    });
    expect(res.status).toBe(409);
  });
});
