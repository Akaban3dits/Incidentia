import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { TicketPriority } from "../../enums/ticketPriority.enum";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { UserRole } from "../../enums/userRole.enum";

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
let token: string;

function signTokenForUser(user: { user_id: string; email: string; name: string }) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: UserRole.Administrador,
    },
    TEST_SECRET,
    { algorithm: "HS256" }
  );
}

async function makeUserAndToken() {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const first_name = "Ana";
  const last_name = "López";
  const email = `ana.${unique}@example.com`;

  const res = await request(app).post("/api/users").send({
    first_name,
    last_name,
    email,
    password: "secreto123",
    phone_number: "+52 123 456 7890",
  });

  // La API devuelve email normalizado (lowercase)
  const user = {
    user_id: res.body.user_id as string,
    email: res.body.email as string,
    name: `${first_name} ${last_name}`,
  };

  return signTokenForUser(user);
}

beforeEach(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  delete process.env.JWT_ISSUER;
  delete process.env.JWT_AUDIENCE;

  // Crea usuario real en DB y firma el token con su user_id (evita error de FK)
  token = await makeUserAndToken();
});

const makeDept = async (name: string) => {
  const res = await request(app)
    .post("/api/departments")
    .set("Authorization", `Bearer ${token}`)
    .send({ name });
  return res.body.id as number;
};

describe("POST /api/tickets", () => {
  let deptId: number;

  beforeEach(async () => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    deptId = await makeDept(`Soporte ${unique}`);
  });

  it("❌ 401 si no envía token", async () => {
    const res = await request(app).post("/api/tickets").send({
      titulo: "Sin token",
      description: "Debe fallar con 401",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });
    expect(res.status).toBe(401);
  });

  it("✅ crea un ticket abierto mínimo (autenticado)", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Impresora no imprime",
        description: "Marca error de papel atascado",
        status: TicketStatus.Abierto,
        department_id: deptId,
      });

    expect(res.status).toBe(201);
    expect(res.body.ticket_id).toBeTruthy();
    expect(res.body.status).toBe(TicketStatus.Abierto);
    expect(res.body.closed_at).toBeNull();
    expect(res.body.department_id).toBe(deptId);
  });

  it("❌ 400 si intenta crear en estado Cerrado", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Ya quedó resuelto",
        description: "Se reinició el servicio",
        status: TicketStatus.Cerrado,
        priority: TicketPriority.Media,
        department_id: deptId,
      });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si faltan campos requeridos", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "",
        description: "",
      });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si status inválido", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Algo",
        description: "Algo",
        status: "XXX",
        department_id: deptId,
      });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si device_id referencia inexistente (FK)", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Con device inexistente",
        description: "Prueba",
        status: TicketStatus.Abierto,
        department_id: deptId,
        device_id: 9_999_999,
      });
    expect([400, 409, 422]).toContain(res.status);
  });

  it("❌ 400 si assigned_user_id formato inválido", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Probando assigned",
        description: "con uuid inválido",
        status: TicketStatus.Abierto,
        department_id: deptId,
        assigned_user_id: "no-es-uuid",
      });
    expect(res.status).toBe(400);
  });
});
