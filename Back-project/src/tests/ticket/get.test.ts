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

describe("GET /api/tickets", () => {
  let deptId: number;
  let t1: any, t2: any;

  beforeEach(async () => {
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
    const res = await request(app).get("/api/tickets?search=correo");
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.rows.some((r: any) => /correo/i.test(r.titulo))).toBe(true);
  });

  it("✅ respeta limit/offset", async () => {
    const res = await request(app).get("/api/tickets?limit=1&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(1);
    expect(typeof res.body.count).toBe("number");
  });

  it("✅ orden por createdAt DESC", async () => {
    const res = await request(app).get(
      "/api/tickets?sort=createdAt&order=DESC&limit=2"
    );
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBeGreaterThanOrEqual(2);
    const [a, b] = res.body.rows;
    expect(new Date(a.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(b.createdAt).getTime()
    );
  });

  it("✅ devuelve un ticket por id", async () => {
    const res = await request(app).get(`/api/tickets/${t1.ticket_id}`);
    expect(res.status).toBe(200);
    expect(res.body.ticket_id).toBe(t1.ticket_id);
  });

  it("❌ 400 si id inválido (no UUID)", async () => {
    const res = await request(app).get(`/api/tickets/123`);
    expect(res.status).toBe(400);
  });

  it("❌ 404 si no existe", async () => {
    const res = await request(app).get(
      `/api/tickets/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`
    );
    expect(res.status).toBe(404);
  });
});
