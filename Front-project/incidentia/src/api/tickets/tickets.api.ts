import api from "../config/axios";
import type { Ticket, CreateTicketPayload } from "../../types/tickets.types";

export const getTickets = async (): Promise<Ticket[]> => {
  const res = await api.get<Ticket[]>("/tickets");
  return res.data;
};

export const getTicketById = async (id: number): Promise<Ticket> => {
  const res = await api.get<Ticket>(`/tickets/${id}`);
  return res.data;
};

export const createTicket = async (
  ticket: CreateTicketPayload
): Promise<Ticket> => {
  const res = await api.post<Ticket>("/tickets", ticket);
  return res.data;
};
