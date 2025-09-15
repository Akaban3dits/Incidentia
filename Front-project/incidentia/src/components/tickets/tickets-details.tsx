/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import type { Ticket, Comment, Task, Document } from "../../types/index";
import { TicketDocuments } from "./TicketDocuments";
import { TicketComments } from "./TicketComments";
import { TicketTask } from "./TicketTasks";
import { TicketSidebar } from "./TicketSidebar";

const mockTicket: Ticket = {
  id: "TK-001",
  title: "Error de conexión a la base de datos",
  description:
    "Los usuarios no pueden acceder al sistema debido a problemas de conectividad con la base de datos.",
  status: "critico",
  priority: "critica",
  category: "Base de Datos",
  reporter: {
    name: "María González",
    email: "maria.gonzalez@empresa.com",
    avatar: "/professional-woman-diverse.png",
  },
  assignee: {
    name: "Carlos Ruiz",
    email: "carlos.ruiz@empresa.com",
    avatar: "/professional-man.png",
  },
  createdAt: "2024-01-15T09:30:00Z",
  updatedAt: "2024-01-15T10:15:00Z",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "abierto":
      return <XCircle className="h-4 w-4 text-blue-500" />;
    case "en-progreso":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cerrado":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "critico":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "abierto":
      return "bg-blue-100 text-blue-800";
    case "en-progreso":
      return "bg-yellow-100 text-yellow-800";
    case "cerrado":
      return "bg-green-100 text-green-800";
    case "critico":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "baja":
      return "bg-gray-100 text-gray-800";
    case "media":
      return "bg-blue-100 text-blue-800";
    case "alta":
      return "bg-orange-100 text-orange-800";
    case "critica":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface TicketDetailsProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket>(mockTicket);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground font-mono text-sm sm:text-base">
            {ticket.id}
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="self-start sm:self-auto">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(ticket.status)} Detalles del Ticket
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {ticket.description}
              </p>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-muted-foreground mt-4 gap-2">
                <span>Creado: {formatDate(ticket.createdAt)}</span>
                <span>Actualizado: {formatDate(ticket.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="comments">Comentarios</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
            </TabsList>
            <TabsContent value="documents">
              <TicketDocuments documents={documents} />
            </TabsContent>
            <TabsContent value="comments">
              <TicketComments
                comments={comments}
                onCommentsChange={setComments}
              />
            </TabsContent>
            <TabsContent value="tasks">
              <TicketTask tasks={tasks} onTasksChange={setTasks} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <TicketSidebar
            ticket={ticket}
            comments={comments}
            tasks={tasks}
            documents={documents}
            setTicket={setTicket}
          />
        </div>
      </div>
    </div>
  );
}
