"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Clock, AlertTriangle, CheckCircle, XCircle, Filter, Search } from "lucide-react"
import { TicketDetails } from "./tickets-details"
import type { Ticket } from "../../types/index"

const mockTickets: Ticket[] = [
  {
    id: "TK-001",
    title: "Error de conexión a la base de datos",
    description: "Los usuarios no pueden acceder al sistema debido a problemas de conectividad con la base de datos.",
    status: "critico",
    priority: "critica",
    category: "Base de Datos",
    reporter: { name: "María González", email: "maria.gonzalez@empresa.com", avatar: "/professional-woman-diverse.png" },
    assignee: { name: "Carlos Ruiz", email: "carlos.ruiz@empresa.com", avatar: "/professional-man.png" },
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "TK-002",
    title: "Solicitud de nuevo software",
    description: "El departamento de marketing necesita licencias adicionales de Adobe Creative Suite.",
    status: "en-progreso",
    priority: "media",
    category: "Software",
    reporter: { name: "Ana López", email: "ana.lopez@empresa.com", avatar: "/professional-woman-marketing.png" },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T08:45:00Z",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "abierto":
      return <XCircle className="h-4 w-4 text-destructive" />
    case "en-progreso":
      return <Clock className="h-4 w-4 text-accent" />
    case "cerrado":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "critico":
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "abierto":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "en-progreso":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "cerrado":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "critico":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "baja":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    case "media":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "alta":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "critica":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function TicketsDashboard() {
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [priorityFilter, setPriorityFilter] = useState<string>("todas")
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reporter.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "todas" || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  if (selectedTicket) {
    return <TicketDetails ticketId={selectedTicket} onBack={() => setSelectedTicket(null)} />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Tickets</h1>
        <Badge variant="outline">{filteredTickets.length} tickets</Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en-progreso">En Progreso</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tarjetas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="hover:shadow-lg transition cursor-pointer border-l-4 border-l-primary"
            onClick={() => setSelectedTicket(ticket.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                {ticket.title}
                {getStatusIcon(ticket.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{ticket.id}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-muted-foreground text-sm">{ticket.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={ticket.reporter.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{ticket.reporter.name[0]}</AvatarFallback>
                </Avatar>
                <span>{ticket.reporter.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Creado: {formatDate(ticket.createdAt)} • Actualizado: {formatDate(ticket.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
