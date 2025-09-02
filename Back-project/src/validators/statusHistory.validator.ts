import { body, param, query } from "express-validator";
import { TicketStatus } from "../enums/ticketStatus.enum";

export const statusHistoryIdParam = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un entero >= 1"),
];

export const statusHistoryCreateValidator = [
  body("ticket_id").isUUID().withMessage("ticket_id debe ser UUID"),
  body("old_status")
    .isIn(Object.values(TicketStatus))
    .withMessage("old_status inválido"),
  body("new_status")
    .isIn(Object.values(TicketStatus))
    .withMessage("new_status inválido"),
  body("changed_by_user_id").isUUID().withMessage("changed_by_user_id debe ser UUID"),
  body("changed_at")
    .optional()
    .isISO8601()
    .withMessage("changed_at debe ser una fecha ISO válida"),
  body().custom((v) => {
    if (v.old_status === v.new_status) {
      throw new Error("old_status y new_status no pueden ser iguales");
    }
    return true;
  }),
];

export const statusHistoryUpdateValidator = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un entero >= 1"),
  body("changed_at")
    .optional()
    .isISO8601()
    .withMessage("changed_at debe ser una fecha ISO válida"),
];

export const statusHistoryListValidator = [
  query("ticketId").optional().isUUID().withMessage("ticketId debe ser UUID"),
  query("changedBy").optional().isUUID().withMessage("changedBy debe ser UUID"),
  query("from").optional().isISO8601().withMessage("from debe ser fecha ISO"),
  query("to").optional().isISO8601().withMessage("to debe ser fecha ISO"),
  query("oldStatus")
    .optional()
    .isIn(Object.values(TicketStatus))
    .withMessage("oldStatus inválido"),
  query("newStatus")
    .optional()
    .isIn(Object.values(TicketStatus))
    .withMessage("newStatus inválido"),
  query("limit").optional().isInt({ min: 1, max: 200 }),
  query("offset").optional().isInt({ min: 0 }),
  query("sort")
    .optional()
    .isIn(["changed_at", "createdAt", "updatedAt"])
    .withMessage("sort inválido"),
  query("order").optional().isIn(["ASC", "DESC"]).withMessage("order inválido"),
];
