import request from "supertest";
import app from "../../app";
import { TicketStatus} from "../../enums/ticketStatus.enum";
import { TicketPriority } from "../../enums/ticketPriority.enum";

const makeDept = async (name: string) => {
  const res = await request(app).post("/api/departments").send({ name });
  return res.body.id as number;
};

const makeTicket = async (payload: any) => {
  const res = await request(app).post("/api/tickets").send(payload);
  return res.body;
};

describe("PUT /api/tickets/:id", () => {
  let deptId: number;
  let ticket: any;

  beforeEach(async () => {
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
      .send({ status: TicketStatus.Cerrado, priority: TicketPriority.Critica });
    expect(close.status).toBe(200);
    expect(close.body.status).toBe(TicketStatus.Cerrado);
    expect(close.body.closed_at).toBeTruthy();

    const reopen = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .send({ status: TicketStatus.Abierto, titulo: "Nuevo título" });
    expect(reopen.status).toBe(200);
    expect(reopen.body.status).toBe(TicketStatus.Abierto);
    expect(reopen.body.closed_at).toBeNull();
    expect(reopen.body.titulo).toMatch(/nuevo/i);
  });

  it("❌ 400 si device_id no existe (FK)", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .send({ device_id: 9999999 });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si assigned_user_id no es UUID", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .send({ assigned_user_id: "xxx" });
    expect(res.status).toBe(400);
  });

  it("❌ 404 si el ticket no existe", async () => {
    const res = await request(app)
      .put(`/api/tickets/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`)
      .send({ titulo: "XXX" });
    expect(res.status).toBe(404);
  });

  it("❌ 400 si parent_ticket_id = id (mismo ticket)", async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticket.ticket_id}`)
      .send({ parent_ticket_id: ticket.ticket_id });
    expect(res.status).toBe(400);
  });
});
