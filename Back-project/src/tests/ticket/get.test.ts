import request from "supertest";
import app from "../../app";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { getAdminToken, withAuth } from "../auth/token";
import { makeDept, makeTicket } from "../utils/tickets";

let token: string;

describe("GET /api/tickets", () => {
  let deptId: number;
  let t1: any, t2: any;

  beforeEach(async () => {
    token = await getAdminToken(false);

    deptId = await makeDept(`Mesa ${Date.now()}`, token);
    t1 = await makeTicket(
      {
        titulo: "Falla de red en piso 3",
        description: "sin internet",
        status: TicketStatus.Abierto,
        department_id: deptId,
      },
      token
    );
    t2 = await makeTicket(
      {
        titulo: "Correo no sincroniza",
        description: "outlook",
        status: TicketStatus.Abierto,
        department_id: deptId,
      },
      token
    );
  });

  it("✅ lista con búsqueda (search)", async () => {
    const res = await withAuth(
      request(app).get("/api/tickets?search=correo"),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((r: any) => /correo/i.test(r.titulo))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await withAuth(
      request(app).get("/api/tickets?limit=1&offset=0"),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(1);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
  });

  it("✅ orden por createdAt DESC", async () => {
    const res = await withAuth(
      request(app).get("/api/tickets?sort=createdAt&order=DESC&limit=2"),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeGreaterThanOrEqual(2);
    const [a, b] = res.body.rows;
    expect(new Date(a.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(b.createdAt).getTime()
    );
  });

  it("✅ devuelve un ticket por id", async () => {
    const res = await withAuth(
      request(app).get(`/api/tickets/${t1.ticket_id}`),
      token
    );
    expect(res.status).toBe(200);
    expect(res.body.ticket_id).toBe(t1.ticket_id);
  });

  it("❌ 400 si id inválido (no UUID)", async () => {
    const res = await withAuth(request(app).get(`/api/tickets/123`), token);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const NON_EXISTING_ID = "00000000-0000-4000-8000-000000000000";
    const res = await withAuth(
      request(app).get(`/api/tickets/${NON_EXISTING_ID}`),
      token
    );
    expect(res.status).toBe(404);
  });
});
