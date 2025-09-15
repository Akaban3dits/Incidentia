"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { User, Search } from "lucide-react"

interface Person {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
}

const mockPeople: Person[] = [
  {
    id: "1",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@empresa.com",
    avatar: "/professional-man.png",
    department: "IT Support",
  },
  {
    id: "2",
    name: "Elena Vega",
    email: "elena.vega@empresa.com",
    avatar: "/professional-woman-it.png",
    department: "IT Infrastructure",
  },
  {
    id: "3",
    name: "Miguel Torres",
    email: "miguel.torres@empresa.com",
    avatar: "/professional-man-it.png",
    department: "Network Admin",
  },
  {
    id: "4",
    name: "Ana López",
    email: "ana.lopez@empresa.com",
    avatar: "/professional-woman-marketing.png",
    department: "Marketing",
  },
  {
    id: "5",
    name: "Roberto Díaz",
    email: "roberto.diaz@empresa.com",
    avatar: "/professional-man-accounting.png",
    department: "Accounting",
  },
]

interface ReassignDialogProps {
  children: React.ReactNode
  onReassign: (personId: string) => void
}

export function ReassignDialog({ children, onReassign }: ReassignDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPeople = mockPeople.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleReassign = (personId: string) => {
    onReassign(personId)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Reasignar Ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar persona..."
              value={searchTerm}
              onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleReassign(person.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={person.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.email}</p>
                  <p className="text-xs text-muted-foreground">{person.department}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredPeople.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">No se encontraron personas</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
