import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { TicketPriority } from "../../enums/ticketPriority.enum";
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

describe("PUT /api/tickets/:id", () => {
  let deptId: number;
  let ticket: any;

  beforeEach(async () => {
    token = await makeUserAndToken(); 
    deptId = await makeDept(`Operación ${Date.now()}`);
    ticket = await makeTicket({
      titulo: "Ticket a actualizar",
      description: "desc",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });
  });

  it("✅ actualiza campos básicos y cierra/reabre (closed_at)", async () => {
    const close = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: TicketStatus.Cerrado, priority: TicketPriority.Critica });
    expect(close.status).toBe(200);
    expect(close.body.status).toBe(TicketStatus.Cerrado);
    expect(close.body.closed_at).toBeTruthy();

    const reopen = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: TicketStatus.Abierto, titulo: "Nuevo título" });
    expect(reopen.status).toBe(200);
    expect(reopen.body.status).toBe(TicketStatus.Abierto);
    expect(reopen.body.closed_at).toBeNull();
    expect(reopen.body.titulo).toMatch(/nuevo/i);
  });

  it("❌ 400 si device_id no existe (FK)", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ device_id: 9999999 });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si assigned_user_id no es UUID", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ assigned_user_id: "xxx" });
    expect(res.status).toBe(400);
  });

  it("❌ 404 si el ticket no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";
    const res = await request(app)
      .put(`/api/tickets/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ titulo: "XXX" });
    expect(res.status).toBe(404);
  });

  it("❌ 400 si parent_ticket_id = id (mismo ticket)", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ parent_ticket_id: ticket.ticket_id });
    expect(res.status).toBe(400);
  });
});
