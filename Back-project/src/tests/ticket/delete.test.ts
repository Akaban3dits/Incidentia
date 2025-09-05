import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
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

beforeEach(async () => {
  token = await makeUserAndToken();
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

describe("DELETE /api/tickets/:id", () => {
  let deptId: number;

  beforeEach(async () => {
    deptId = await makeDept(`Calidad ${Date.now()}`);
  });

  it("✅ elimina y responde 204", async () => {
    const t = await makeTicket({
      titulo: "Para borrar",
      description: "prueba",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });

    const del = await request(app)
      .delete(`/api/tickets/${t.ticket_id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/tickets/${t.ticket_id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  it("❌ 404 si no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";

    const res = await request(app)
      .delete(`/api/tickets/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
