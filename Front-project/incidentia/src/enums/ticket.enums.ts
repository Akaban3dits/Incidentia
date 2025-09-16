export type TicketStatus = 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';

export const TicketStatus = {
  Abierto: 'Abierto' as TicketStatus,
  EnProgreso: 'En Progreso' as TicketStatus,
  Resuelto: 'Resuelto' as TicketStatus,
  Cerrado: 'Cerrado' as TicketStatus
};

export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export const TicketPriority = {
  Baja: 'Baja' as TicketPriority,
  Media: 'Media' as TicketPriority,
  Alta: 'Alta' as TicketPriority,
  Critica: 'Crítica' as TicketPriority
};
