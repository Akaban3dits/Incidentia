import request from "supertest";
import app from "../../app";
import { TicketPriority } from "../../enums/ticketPriority.enum";
import { TicketStatus } from "../../enums/ticketStatus.enum";
import { getAdminToken, withAuth } from "../auth/token";

let token: string;

const makeDept = async (name: string) => {
  const res = await withAuth(request(app).post("/api/departments"), token).send({ name });
  return res.body.id as number;
};

describe("POST /api/tickets", () => {
  let deptId: number;

  beforeEach(async () => {
    token = await getAdminToken(false);

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
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
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
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
      titulo: "Ya quedó resuelto",
      description: "Se reinició el servicio",
      status: TicketStatus.Cerrado,
      priority: TicketPriority.Media,
      department_id: deptId,
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si faltan campos requeridos", async () => {
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
      titulo: "",
      description: "",
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si status inválido", async () => {
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
      titulo: "Algo",
      description: "Algo",
      status: "XXX",
      department_id: deptId,
    });
    expect(res.status).toBe(400);
  });

  it("❌ 400 si device_id referencia inexistente (FK)", async () => {
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
      titulo: "Con device inexistente",
      description: "Prueba",
      status: TicketStatus.Abierto,
      department_id: deptId,
      device_id: 9_999_999,
    });
    expect([400, 409, 422]).toContain(res.status);
  });

  it("❌ 400 si assigned_user_id formato inválido", async () => {
    const res = await withAuth(request(app).post("/api/tickets"), token).send({
      titulo: "Probando assigned",
      description: "con uuid inválido",
      status: TicketStatus.Abierto,
      department_id: deptId,
      assigned_user_id: "no-es-uuid",
    });
    expect(res.status).toBe(400);
  });
});
