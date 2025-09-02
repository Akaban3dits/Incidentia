import { body, param, query } from "express-validator";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

export const ticketCreateValidator = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es obligatorio.")
    .isLength({ min: 3, max: 255 })
    .withMessage("El título debe tener entre 3 y 255 caracteres."),
  body("description")
    .notEmpty()
    .withMessage("La descripción es obligatoria."),
  body("status")
    .notEmpty()
    .withMessage("El estado es obligatorio.")
    .isIn(Object.values(TicketStatus))
    .withMessage("Estado inválido."),
  body("priority")
    .optional()
    .isIn(Object.values(TicketPriority))
    .withMessage("Prioridad inválida."),
  body("device_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del dispositivo debe ser un número válido."),
  body("assigned_user_id")
    .optional()
    .isUUID()
    .withMessage("El usuario asignado debe ser un UUID válido."),
  body("department_id")
    .notEmpty()
    .withMessage("El departamento es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El ID de departamento debe ser un número válido."),
  body("parent_ticket_id")
    .optional()
    .isUUID()
    .withMessage("El ticket padre debe ser un UUID válido."),
];

export const ticketUpdateValidator = [
  param("id")
    .isUUID()
    .withMessage("El ID del ticket debe ser un UUID válido."),
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
    .withMessage("El ID del dispositivo debe ser un número válido."),
  body("assigned_user_id")
    .optional()
    .isUUID()
    .withMessage("El usuario asignado debe ser un UUID válido."),
  body("department_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de departamento debe ser un número válido."),
  body("parent_ticket_id")
    .optional()
    .isUUID()
    .withMessage("El ticket padre debe ser un UUID válido."),
];

export const ticketIdValidator = [
  param("id").isUUID().withMessage("El ID debe ser un UUID válido."),
];

export const ticketListValidator = [
  query("search").optional().isString().withMessage("El parámetro de búsqueda debe ser texto."),
  query("limit").optional().isInt({ min: 1 }).withMessage("El límite debe ser un número positivo."),
  query("offset").optional().isInt({ min: 0 }).withMessage("El offset debe ser un número válido."),
  query("sort")
    .optional()
    .isIn(["titulo", "status", "priority", "createdAt"])
    .withMessage("El campo de ordenamiento no es válido."),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("El orden debe ser ASC o DESC."),
];
