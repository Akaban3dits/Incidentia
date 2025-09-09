import request from "supertest";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { TicketPriority } from "../../enums/ticketPriority.enum";
import { getAdminToken, withAuth } from "../auth/token";

let token: string;

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  delete process.env.JWT_ISSUER;
  delete process.env.JWT_AUDIENCE;
});

const makeDept = async (name: string) => {
  const res = await withAuth(request(app).post("/api/departments"), token).send({ name });
  return res.body.id as number;
};

const makeTicket = async (payload: any) => {
  const res = await withAuth(request(app).post("/api/tickets"), token).send(payload);
  return res.body;
};

describe("PUT /api/tickets/:id", () => {
  let deptId: number;
  let ticket: any;

  beforeEach(async () => {
    token = await getAdminToken();
    deptId = await makeDept(`Operación ${Date.now()}`);
    ticket = await makeTicket({
      titulo: "Ticket a actualizar",
      description: "desc",
      status: TicketStatus.Abierto,
      department_id: deptId,
    });
  });

  it("✅ actualiza status/priority y cierra/reabre (closed_at se ajusta automáticamente)", async () => {
    const close = await withAuth(
      request(app).put(`/api/tickets/${ticket.ticket_id}`),
      token
    ).send({ status: TicketStatus.Cerrado, priority: TicketPriority.Critica });

    expect(close.status).toBe(200);
    expect(close.body.status).toBe(TicketStatus.Cerrado);
    expect(close.body.closed_at).toBeTruthy();

    const reopen = await withAuth(
      request(app).put(`/api/tickets/${ticket.ticket_id}`),
      token
    ).send({ status: TicketStatus.Abierto });

    expect(reopen.status).toBe(200);
    expect(reopen.body.status).toBe(TicketStatus.Abierto);
    expect(reopen.body.closed_at).toBeNull();
  });

  it("❌ 400 si assigned_user_id no es UUID", async () => {
    const res = await withAuth(
      request(app).put(`/api/tickets/${ticket.ticket_id}`),
      token
    ).send({ assigned_user_id: "xxx" });

    expect(res.status).toBe(400);
  });

  it("❌ 404 si el ticket no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";
    const res = await withAuth(
      request(app).put(`/api/tickets/${NON_EXISTING_ID}`),
      token
    ).send({ status: TicketStatus.Abierto });

    expect(res.status).toBe(404);
  });
});
