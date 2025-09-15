"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { User, Clock, AlertTriangle } from "lucide-react"
import { ReassignDialog } from "../tickets/dialogs/reassign-dialog"
import { StatusDialog } from "../tickets/dialogs/status-dialog"
import { PriorityDialog } from "../tickets/dialogs/priority-dialog"
import type { Ticket, Comment, Task, Document } from "../../types/index"

interface TicketSidebarProps {
  ticket: Ticket
  comments: Comment[]
  tasks: Task[]
  documents: Document[]
  setTicket: (ticket: Ticket) => void
}

export function TicketSidebar({ ticket, comments, tasks, documents, setTicket }: TicketSidebarProps) {
  const handleReassign = (personId: string) => {
    console.log("Reasignando a:", personId)
  }

  const handleStatusChange = (newStatus: string) => {
    setTicket({ ...ticket, status: newStatus as Ticket["status"] })
  }

  const handlePriorityChange = (newPriority: string) => {
    setTicket({ ...ticket, priority: newPriority as Ticket["priority"] })
  }

  return (
    <div className="space-y-6">
      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ReassignDialog onReassign={handleReassign}>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <User className="h-4 w-4 mr-2" />
              Reasignar Ticket
            </Button>
          </ReassignDialog>

          <StatusDialog currentStatus={ticket.status} onStatusChange={handleStatusChange}>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Clock className="h-4 w-4 mr-2" />
              Cambiar Estado
            </Button>
          </StatusDialog>

          <PriorityDialog currentPriority={ticket.priority} onPriorityChange={handlePriorityChange}>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Cambiar Prioridad
            </Button>
          </PriorityDialog>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comentarios:</span>
            <span className="font-medium">{comments.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tareas totales:</span>
            <span className="font-medium">{tasks.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tareas completadas:</span>
            <span className="font-medium">{tasks.filter((t) => t.completed).length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Documentos:</span>
            <span className="font-medium">{documents.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
