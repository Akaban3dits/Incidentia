"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTicketsThunk } from "../../store/tickets/tickets.slice";
import type { Ticket } from "../../types/tickets.types"; 
import { TicketStatus, TicketPriority } from "../../enums/ticket.enums";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Clock, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { TicketDetails } from "./tickets-details";

const getStatusIcon = (status: Ticket["status"]) => {
  switch (status) {
    case TicketStatus.Abierto:
      return <XCircle className="h-4 w-4 text-destructive" />;
    case TicketStatus.EnProgreso:
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case TicketStatus.Resuelto:
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case TicketStatus.Cerrado:
      return <CheckCircle className="h-4 w-4 text-green-700" />;
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: Ticket["status"]) => {
  switch (status) {
    case TicketStatus.Abierto:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case TicketStatus.EnProgreso:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case TicketStatus.Resuelto:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case TicketStatus.Cerrado:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const getPriorityColor = (priority?: Ticket["priority"] | null) => {
  switch (priority) {
    case TicketPriority.Baja:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    case TicketPriority.Media:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case TicketPriority.Alta:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case TicketPriority.Critica:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function TicketsDashboard() {
  const dispatch = useAppDispatch();
  const { items: tickets, loading, error, total } = useAppSelector((s) => s.tickets);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    // Puedes pasar params: { search, limit, offset, sort, order }
    void dispatch(fetchTicketsThunk({ sort: "createdAt", order: "ASC" }));
  }, [dispatch]);

  const filteredTickets = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return tickets.filter((t) => {
      const matchesSearch =
        t.titulo.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.created_by_name ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "todos" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "todas" || (t.priority ?? "") === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (selectedTicket) {
    return <TicketDetails ticketId={selectedTicket} onBack={() => setSelectedTicket(null)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-3xl font-bold">Dashboard de Tickets</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" title={`Total en servidor: ${total}`}>
            {filteredTickets.length} visibles
          </Badge>
          {loading && <span className="text-sm text-muted-foreground">cargando…</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
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
              placeholder="Buscar por título, descripción o creador…"
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
              <SelectItem value={TicketStatus.Abierto}>{TicketStatus.Abierto}</SelectItem>
              <SelectItem value={TicketStatus.EnProgreso}>{TicketStatus.EnProgreso}</SelectItem>
              <SelectItem value={TicketStatus.Resuelto}>{TicketStatus.Resuelto}</SelectItem>
              <SelectItem value={TicketStatus.Cerrado}>{TicketStatus.Cerrado}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value={TicketPriority.Baja}>{TicketPriority.Baja}</SelectItem>
              <SelectItem value={TicketPriority.Media}>{TicketPriority.Media}</SelectItem>
              <SelectItem value={TicketPriority.Alta}>{TicketPriority.Alta}</SelectItem>
              <SelectItem value={TicketPriority.Critica}>{TicketPriority.Critica}</SelectItem>
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
                {ticket.titulo}
                {getStatusIcon(ticket.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{ticket.id}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-muted-foreground text-sm">{ticket.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                {ticket.priority && (
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {(ticket.created_by_name?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{ticket.created_by_name ?? "Desconocido"}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Creado: {formatDate(ticket.createdAt)} • Actualizado: {formatDate(ticket.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
