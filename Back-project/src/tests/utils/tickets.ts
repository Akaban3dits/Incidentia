import request from "supertest";
import app from "../../app";
import { withAuth } from "../auth/token";
import { TicketStatus } from "../../enums/ticketStatus.enum";

export const makeDept = async (name: string, token: string) => {
  const res = await withAuth(
    request(app).post("/api/departments").send({ name }),
    token
  );
  return res.body.id as number;
};

export const makeTicket = async (
  payload: Partial<{
    titulo: string;
    description: string;
    status: TicketStatus;
    department_id: number;
  }>,
  token: string
) => {
  const res = await withAuth(
    request(app)
      .post("/api/tickets")
      .send({
        titulo: "Ticket de prueba",
        description: "Descripción de prueba",
        status: TicketStatus.Abierto,
        ...payload,
      }),
    token
  );
  return res.body;
};
