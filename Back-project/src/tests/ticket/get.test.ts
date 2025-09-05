import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { UserRole } from "../../enums/userRole.enum";

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
let token: string;

function signTokenForUser(user: {
  user_id: string;
  email: string;
  name: string;
}) {
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

  const user = {
    user_id: res.body.user_id as string,
    email: res.body.email as string,
    name: `${first_name} ${last_name}`,
  };

  return signTokenForUser(user);
}

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
  delete process.env.JWT_ISSUER;
  delete process.env.JWT_AUDIENCE;
});

const makeDept = async (name: string) => {
  const res = await request(app)
    .post("/api/departments")
    .set("Authorization", `Bearer ${token}`)
    .send({ name });
  return res.body.id as number;
};

const makeTicket = async (payload: any) => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);
  return res.body;
};

describe("GET /api/tickets", () => {
  let deptId: number;
  let t1: any, t2: any;

  beforeEach(async () => {
    token = await makeUserAndToken();

    deptId = await makeDept(`Mesa ${Date.now()}`);
    t1 = await makeTicket({
      titulo: "Falla de red en piso 3",
      description: "sin internet",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });
    t2 = await makeTicket({
      titulo: "Correo no sincroniza",
      description: "outlook",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await request(app)
      .get("/api/tickets?search=correo")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((r: any) => /correo/i.test(r.titulo))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await request(app)
      .get("/api/tickets?limit=1&offset=0")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(1);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ orden por createdAt DESC", async () => {
    const res = await request(app)
      .get("/api/tickets?sort=createdAt&order=DESC&limit=2")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeGreaterThanOrEqual(2);
    const [a, b] = res.body.rows;
    expect(new Date(a.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(b.createdAt).getTime()
    );
  });

  it("✅ devuelve un ticket por id", async () => {
    const res = await request(app)
      .get(`/api/tickets/${t1.ticket_id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ticket_id).toBe(t1.ticket_id);
  });

  it("❌ 400 si id inválido (no UUID)", async () => {
    const res = await request(app)
      .get(`/api/tickets/123`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";
    const res = await request(app)
      .get(`/api/tickets/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
