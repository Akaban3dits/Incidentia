export interface CreateCommentInput {
  comment_text: string;
  ticket_id: string;       
  user_id: string;         
  parent_comment_id?: string | null; 
}

export interface UpdateCommentInput {
  comment_text?: string;
}

export interface ListCommentsParams {
  ticketId?: string;                
  parentId?: string | null;         
  topLevel?: boolean;               
  search?: string;                  
  limit?: number;
  offset?: number;
  sort?: "createdAt" | "updatedAt";
  order?: "ASC" | "DESC";
}
