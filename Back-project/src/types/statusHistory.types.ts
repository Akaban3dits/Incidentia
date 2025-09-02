import { TicketStatus } from "../enums/ticketStatus.enum";

export interface CreateStatusHistoryInput {
  ticket_id: string;               
  old_status: TicketStatus;
  new_status: TicketStatus;
  changed_by_user_id: string;      
  changed_at?: Date | string;      
}


export interface UpdateStatusHistoryInput {
  changed_at?: Date | string;
}

export interface ListStatusHistoryParams {
  ticketId?: string;               
  changedBy?: string;              
  from?: Date | string;            
  to?: Date | string;              
  oldStatus?: TicketStatus;        
  newStatus?: TicketStatus;        

  limit?: number;
  offset?: number;
  sort?: "changed_at" | "createdAt" | "updatedAt";
  order?: "ASC" | "DESC";
}
