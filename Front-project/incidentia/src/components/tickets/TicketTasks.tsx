"use client"

import { useState, type SetStateAction } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Checkbox } from "../ui/checkbox"
import { User, Calendar, Plus, CheckSquare } from "lucide-react"

interface Task {
  id: string
  title: string
  completed: boolean
  assignee?: string
  dueDate?: string
}

interface TicketTaskProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export function TicketTask({ tasks, onTasksChange }: TicketTaskProps) {
  const [newTask, setNewTask] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleTask = (taskId: string) => {
    onTasksChange(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        assignee: "Usuario Actual",
      }
      onTasksChange([...tasks, task])
      setNewTask("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tareas por Completar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignee}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <Input
            placeholder="Nueva tarea..."
            value={newTask}
            onChange={(e: { target: { value: SetStateAction<string> } }) => setNewTask(e.target.value)}
            onKeyPress={(e: { key: string }) => e.key === "Enter" && handleAddTask()}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddTask} disabled={!newTask.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarea
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
