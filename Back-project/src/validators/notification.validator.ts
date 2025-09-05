import { body, param, query } from "express-validator";
import { NotificationType } from "../enums/notificationType.enum";

export const notificationIdParam = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser entero >= 1"),
];

export const notificationCreateValidator = [
  body("type").isIn(Object.values(NotificationType)).withMessage("type inválido"),
  body("message").trim().isLength({ min: 1, max: 5000 }).withMessage("message requerido (1-5000)"),
  body("ticket_id").optional({ nullable: true }).isUUID().withMessage("ticket_id debe ser UUID"),
  body("recipients").isArray({ min: 1 }).withMessage("recipients debe ser un arreglo con al menos 1 elemento"),
  body("recipients.*").isUUID().withMessage("Cada recipient debe ser un UUID"),
];

export const notificationListValidator = [
  query("ticketId").optional().isUUID(),
  query("type").optional().isIn(Object.values(NotificationType)),
  query("search").optional().isString(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("limit").optional().isInt({ min: 1, max: 200 }),
  query("offset").optional().isInt({ min: 0 }),
  query("sort").optional().isIn(["createdAt", "updatedAt", "notification_id"]),
  query("order").optional().isIn(["ASC", "DESC"]),
];

export const notificationByUserListValidator = [
  query("userId").isUUID().withMessage("userId es requerido y debe ser UUID"),
  query("unreadOnly").optional().toBoolean().isBoolean(),
  query("hidden").optional().toBoolean().isBoolean(),
  query("type").optional().isIn(Object.values(NotificationType)),
  query("ticketId").optional().isUUID(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("limit").optional().isInt({ min: 1, max: 200 }),
  query("offset").optional().isInt({ min: 0 }),
  query("sort").optional().isIn(["createdAt", "updatedAt", "notification_id"]),
  query("order").optional().isIn(["ASC", "DESC"]),
];

export const notificationMarkReadValidator = [
  param("id").isInt({ min: 1 }).withMessage("id debe ser entero >= 1"),
  body("userId").isUUID().withMessage("userId debe ser UUID"),
  body("read").optional().toBoolean().isBoolean(),
];

export const notificationHideValidator = [
  param("id").isInt({ min: 1 }).withMessage("id debe ser entero >= 1"),
  body("userId").isUUID().withMessage("userId debe ser UUID"),
  body("hidden").optional().toBoolean().isBoolean(),
];
