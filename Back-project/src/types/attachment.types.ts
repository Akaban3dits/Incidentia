export type CreateAttachmentInput = {
  ticket_id: string;
  file_path: string;
  original_filename: string;
  is_image?: boolean;
  uploaded_at?: Date;
};

export type UpdateAttachmentInput = Partial<
  Pick<CreateAttachmentInput, "file_path" | "original_filename" | "is_image">
>;

export type ListAttachmentsParams = {
  ticketId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "uploaded_at" | "original_filename";
  order?: "ASC" | "DESC";
};
