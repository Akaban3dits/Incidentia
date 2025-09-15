"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { AlertTriangle } from "lucide-react"

const priorityOptions = [
  { value: "baja", label: "Baja", color: "text-gray-600" },
  { value: "media", label: "Media", color: "text-blue-600" },
  { value: "alta", label: "Alta", color: "text-orange-600" },
  { value: "critica", label: "Crítica", color: "text-red-600" },
]

interface PriorityDialogProps {
  children: React.ReactNode
  currentPriority: string
  onPriorityChange: (priority: string) => void
}

export function PriorityDialog({ children, currentPriority, onPriorityChange }: PriorityDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState(currentPriority)

  const handleSave = () => {
    onPriorityChange(selectedPriority)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Cambiar Prioridad
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${option.color.replace("text-", "bg-")}`} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
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
