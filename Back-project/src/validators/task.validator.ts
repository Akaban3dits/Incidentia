import { body, param, query } from "express-validator";

export const taskIdParam = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la tarea debe ser un entero >= 1"),
];

export const taskCreateValidator = [
  body("task_description")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("task_description es requerido (1-5000 caracteres)"),
  body("ticket_id")
    .isUUID()
    .withMessage("ticket_id debe ser un UUID válido"),
  body("is_completed")
    .optional()
    .isBoolean()
    .withMessage("is_completed debe ser booleano"),
];

export const taskUpdateValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID de la tarea debe ser un entero >= 1"),
  body("task_description")
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("task_description debe tener entre 1 y 5000 caracteres"),
  body("is_completed")
    .optional()
    .isBoolean()
    .withMessage("is_completed debe ser booleano"),
];

export const taskListValidator = [
  query("ticketId").optional().isUUID().withMessage("ticketId debe ser un UUID válido"),
  query("isCompleted").optional().toBoolean().isBoolean().withMessage("isCompleted debe ser booleano"),
  query("search").optional().isString().withMessage("search debe ser una cadena"),
  query("completedFrom").optional().isISO8601().withMessage("completedFrom debe ser fecha ISO"),
  query("completedTo").optional().isISO8601().withMessage("completedTo debe ser fecha ISO"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit debe ser un entero entre 1 y 200"),
  query("offset").optional().isInt({ min: 0 }).withMessage("offset debe ser un entero >= 0"),
  query("sort")
    .optional()
    .isIn(["createdAt", "updatedAt", "completed_at", "task_description", "is_completed"])
    .withMessage("sort inválido"),
  query("order").optional().isIn(["ASC", "DESC"]).withMessage("order debe ser ASC o DESC"),
];
