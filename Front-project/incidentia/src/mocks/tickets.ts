import type { Ticket } from "../types/index";

export const mockTickets: Ticket[] = [
  {
    id: "TK-001",
    title: "Error de conexión a la base de datos",
    description: "Los usuarios no pueden acceder al sistema...",
    status: "critico",
    priority: "critica",
    category: "Base de Datos",
    reporter: {
      id: "u1",
      name: "María González",
      email: "maria.gonzalez@empresa.com",
      avatar: "/professional-woman.png",
    },
    assignee: {
      id: "u2",
      name: "Carlos Ruiz",
      email: "carlos.ruiz@empresa.com",
      avatar: "/professional-man.png",
    },
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "TK-002",
    title: "Solicitud de nuevo software",
    description: "El departamento de marketing necesita licencias adicionales...",
    status: "en-progreso",
    priority: "media",
    category: "Software",
    reporter: {
      id: "u3",
      name: "Ana López",
      email: "ana.lopez@empresa.com",
      avatar: "/professional-woman-it.png",
    },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T08:45:00Z",
  }
]
