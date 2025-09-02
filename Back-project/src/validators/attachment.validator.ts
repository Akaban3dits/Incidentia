import { body, param, query } from "express-validator";

export const attachmentIdParam = [
  param("id").isUUID().withMessage("ID inválido"),
];

export const attachmentCreateValidator = [
  body("file_path").trim().notEmpty().withMessage("file_path es obligatorio"),
  body("original_filename").trim().notEmpty().withMessage("original_filename es obligatorio"),
  body("is_image").optional().isBoolean(),

  body("ticket_id").optional().isUUID(),
  body("comment_id").optional().isUUID(),
  body().custom((v) => {
    const hasTicket = !!v.ticket_id;
    const hasComment = !!v.comment_id;
    if ((hasTicket || hasComment) && !(hasTicket && hasComment)) return true;
    throw new Error("Debes enviar ticket_id O comment_id (exclusivo).");
  }),
];

export const attachmentUpdateValidator = [
  param("id").isUUID().withMessage("ID inválido"),
  body("file_path").optional().trim().notEmpty().withMessage("file_path no puede ser vacío"),
  body("original_filename").optional().trim().notEmpty().withMessage("original_filename no puede ser vacío"),
  body("is_image").optional().isBoolean(),
];

export const attachmentListValidator = [
  query("ticketId").optional().isUUID(),
  query("commentId").optional().isUUID(),
  query("isImage").optional().isBoolean(),
  query("uploadedFrom").optional().isISO8601(),
  query("uploadedTo").optional().isISO8601(),
  query("search").optional().isString(),
  query("limit").optional().isInt({ min: 1 }),
  query("offset").optional().isInt({ min: 0 }),
  query("sort").optional().isIn(["uploaded_at", "original_filename", "createdAt"]),
  query("order").optional().isIn(["ASC", "DESC"]),
];
