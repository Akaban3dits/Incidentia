
export interface User {
  id?: string
  name: string
  email?: string
  avatar?: string
  department?: string
}


export interface UserCreate {
  name: string
  email: string
  password: string
  departmentId: string
  role?: "admin" | "user"
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "abierto" | "en-progreso" | "cerrado" | "critico"
  priority: "baja" | "media" | "alta" | "critica"
  category: string
  reporter: User
  assignee?: User
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  author: User
  content: string
  timestamp: string
  isInternal: boolean
}

export interface Task {
  id: string
  title: string
  completed: boolean
  assignee?: string
  dueDate?: string
}

export interface Document {
  id: string
  name: string
  type: "document" | "image"
  size: string
  uploadedBy: string
  uploadedAt: string
  url: string
}
