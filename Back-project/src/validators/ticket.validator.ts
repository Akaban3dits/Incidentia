import { body, param, query } from "express-validator";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

export const ticketCreateValidator = [
  body("titulo")
    .notEmpty()
    .isLength({ min: 3, max: 255 })
    .withMessage("El título debe tener entre 3 y 255 caracteres."),
  body("description").notEmpty().withMessage("La descripción es obligatoria."),
  body("status")
    .notEmpty()
    .isIn(Object.values(TicketStatus))
    .withMessage("Estado inválido."),
  body("priority")
    .optional()
    .isIn(Object.values(TicketPriority))
    .withMessage("Prioridad inválida."),
  body("device_id")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("device_id debe ser entero >= 1."),
  body("assigned_user_id")
    .optional()
    .isUUID()
    .withMessage("assigned_user_id debe ser UUID."),
  body("department_id")
    .notEmpty()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("department_id debe ser entero >= 1."),
  body("parent_ticket_id")
    .optional()
    .isUUID()
    .withMessage("parent_ticket_id debe ser UUID."),
];

export const ticketUpdateValidator = [
  param("id").isUUID().withMessage("El ID del ticket debe ser un UUID válido."),
  body("titulo")
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage("El título debe tener entre 3 y 255 caracteres."),
  body("status")
    .optional()
    .isIn(Object.values(TicketStatus))
    .withMessage("Estado inválido."),
  body("priority")
    .optional()
    .isIn(Object.values(TicketPriority))
    .withMessage("Prioridad inválida."),
  body("device_id")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("device_id debe ser entero >= 1."),
  body("assigned_user_id")
    .optional()
    .isUUID()
    .withMessage("assigned_user_id debe ser UUID."),
  body("department_id")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("department_id debe ser entero >= 1."),
  body("parent_ticket_id")
    .optional()
    .isUUID()
    .withMessage("parent_ticket_id debe ser UUID."),
];

export const ticketIdValidator = [
  param("id").isUUID().withMessage("El ID debe ser un UUID válido."),
];

export const ticketListValidator = [
  query("search").optional().isString().withMessage("search debe ser texto."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .toInt()
    .withMessage("limit debe ser 1..200."),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage("offset debe ser >= 0."),
  query("sort")
    .optional()
    .isIn(["titulo", "status", "priority", "createdAt"])
    .withMessage("sort inválido."),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("order debe ser ASC o DESC."),
];
