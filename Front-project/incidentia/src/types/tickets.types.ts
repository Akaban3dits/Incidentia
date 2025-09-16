import { TicketStatus, TicketPriority } from "../enums/ticket.enums";

export interface Ticket {
  id: string;                         
  titulo: string;                     
  description: string;
  status: TicketStatus;               
  priority?: TicketPriority | null;   
  department_id: number;
  device_id?: number | null;
  assigned_user_id?: string | null;
  parent_ticket_id?: string | null;
  created_by_id?: string | null;
  created_by_name?: string | null;
  created_by_email?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  titulo: string;
  description: string;
  status: TicketStatus;
  priority?: TicketPriority | null;
  department_id: number;
  device_id?: number | null;
  assigned_user_id?: string | null;
  parent_ticket_id?: string | null;
}

export interface UpdateTicketPayload {
  titulo?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority | null;
  department_id?: number;
  device_id?: number | null;
  assigned_user_id?: string | null;
  parent_ticket_id?: string | null;
}

export type TicketListSort = "titulo" | "status" | "priority" | "createdAt";
export type TicketListOrder = "ASC" | "DESC";

export interface TicketListQuery {
  search?: string | null;
  limit?: number;      
  offset?: number;     
  sort?: TicketListSort;
  order?: TicketListOrder;
}

export type TicketListResponse =
  | Ticket[]
  | { rows: Ticket[]; count: number };
