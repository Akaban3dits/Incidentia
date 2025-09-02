export interface CreateTaskInput {
  task_description: string;
  ticket_id: string;          
  is_completed?: boolean;    
}

export interface UpdateTaskInput {
  task_description?: string;
  is_completed?: boolean;
}

export interface ListTasksParams {
  ticketId?: string;                 
  isCompleted?: boolean;             
  search?: string;                   
  completedFrom?: Date | string;     
  completedTo?: Date | string;       

  limit?: number;
  offset?: number;
  sort?: "createdAt" | "updatedAt" | "completed_at" | "task_description" | "is_completed";
  order?: "ASC" | "DESC";
}
