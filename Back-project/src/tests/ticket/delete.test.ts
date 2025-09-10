import request from "supertest";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { getAdminToken, withAuth } from "../auth/token";

let token: string;

beforeEach(async () => {
  token = await getAdminToken(false);
});

const makeDept = async (name: string) => {
  const res = await withAuth(
    request(app).post("/api/departments").send({ name }),
    token
  );
  return res.body.id as number;
};

const makeTicket = async (payload: any) => {
  const res = await withAuth(
    request(app).post("/api/tickets").send(payload),
    token
  );
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

    const del = await withAuth(
      request(app).delete(`/api/tickets/${t.ticket_id}`),
      token
    );

    expect(del.status).toBe(204);
    expect(del.body).toEqual({});

    const get = await withAuth(
      request(app).get(`/api/tickets/${t.ticket_id}`),
      token
    );
    expect(get.status).toBe(404);
  });

  it("❌ 404 si no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";
    const res = await withAuth(
      request(app).delete(`/api/tickets/${NON_EXISTING_ID}`),
      token
    );
    expect(res.status).toBe(404);
  });
});
