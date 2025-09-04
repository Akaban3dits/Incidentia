import request from "supertest";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";

const makeDept = async (name: string) => {
  const res = await request(app).post("/api/departments").send({ name });
  return res.body.id as number;
};

const makeTicket = async (payload: any) => {
  const res = await request(app).post("/api/tickets").send(payload);
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

    const del = await request(app).delete(`/api/tickets/${t.ticket_id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/tickets/${t.ticket_id}`);
    expect(get.status).toBe(404);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).delete(
      `/api/tickets/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`
    );
    expect(res.status).toBe(404);
  });
});
