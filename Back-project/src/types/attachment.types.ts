export interface CreateAttachmentInput {
  file_path: string;
  original_filename: string;
  is_image?: boolean;
  uploaded_at?: Date;
  ticket_id?: string | null;
  comment_id?: string | null;
}

export interface UpdateAttachmentInput {
  file_path?: string;
  original_filename?: string;
  is_image?: boolean;
}

export interface ListAttachmentsParams {
  ticketId?: string;
  commentId?: string;
  isImage?: boolean;
  uploadedFrom?: Date | string;
  uploadedTo?: Date | string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "uploaded_at" | "original_filename" | "createdAt";
  order?: "ASC" | "DESC";
}
