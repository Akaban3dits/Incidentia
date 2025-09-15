"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const statusOptions = [
  { value: "abierto", label: "Abierto", icon: XCircle, color: "text-blue-600" },
  { value: "en-progreso", label: "En Progreso", icon: Clock, color: "text-yellow-600" },
  { value: "cerrado", label: "Cerrado", icon: CheckCircle, color: "text-green-600" },
  { value: "critico", label: "Crítico", icon: AlertTriangle, color: "text-red-600" },
]

interface StatusDialogProps {
  children: React.ReactNode
  currentStatus: string
  onStatusChange: (status: string) => void
}

export function StatusDialog({ children, currentStatus, onStatusChange }: StatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const handleSave = () => {
    onStatusChange(selectedStatus)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cambiar Estado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => {
                const Icon = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
