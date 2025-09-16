import type { RootState } from "../store";

export const selectTickets = (s: RootState) => s.tickets.items;
export const selectTicketsTotal = (s: RootState) => s.tickets.total;
export const selectTicketsLoading = (s: RootState) => s.tickets.loading;
export const selectTicketsError = (s: RootState) => s.tickets.error;

export const selectTicketById = (id: string) => (s: RootState) =>
  s.tickets.items.find(t => t.id === id);
