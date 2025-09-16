import api from "../config/axios";
import type {
  Ticket,
  TicketListQuery,
  TicketListResponse,
  CreateTicketPayload,
  UpdateTicketPayload,
} from "../../types/tickets.types";

const normalizeList = (data: TicketListResponse) => {
  if (Array.isArray(data)) {
    return { rows: data, count: data.length };
  }
  return data; 
};

export const getTickets = async (
  params?: TicketListQuery
): Promise<{ rows: Ticket[]; count: number }> => {
  const res = await api.get<TicketListResponse>("/tickets", { params });
  return normalizeList(res.data);
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  const res = await api.get<Ticket>(`/tickets/${id}`);
  return res.data;
};

export const createTicket = async (
  payload: CreateTicketPayload
): Promise<Ticket> => {
  const res = await api.post<Ticket>("/tickets", payload);
  return res.data;
};

export const updateTicket = async (
  id: string,
  payload: UpdateTicketPayload
): Promise<Ticket> => {
  const res = await api.put<Ticket>(`/tickets/${id}`, payload);
  return res.data;
};

export const deleteTicket = async (id: string): Promise<void> => {
  await api.delete(`/tickets/${id}`);
};
