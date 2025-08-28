import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

export interface CreateTicketInput {
  titulo: string;
  description: string;
  status: TicketStatus;
  priority?: TicketPriority | null;
  device_id?: number | null;
  assigned_user_id?: string | null;
  department_id: number;
  parent_ticket_id?: string | null;
}

export interface UpdateTicketInput {
  titulo?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority | null;
  device_id?: number | null;
  assigned_user_id?: string | null;
  department_id?: number;
  parent_ticket_id?: string | null;
  closed_at?: Date | null;
}

export interface ListTicketsParams {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "titulo" | "status" | "priority" | "createdAt";
  order?: "ASC" | "DESC";
}
