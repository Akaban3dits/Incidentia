export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  status: string;
}
