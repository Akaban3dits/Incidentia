import { body, param, query } from "express-validator";

export const commentIdParam = [
  param("id").isUUID().withMessage("El ID del comentario debe ser un UUID válido"),
];

export const commentCreateValidator = [
  body("comment_text")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("comment_text es requerido (1-5000 caracteres)"),

  body("ticket_id")
    .isUUID()
    .withMessage("ticket_id debe ser un UUID válido"),

  body("user_id")
    .isUUID()
    .withMessage("user_id debe ser un UUID válido"),

  body("parent_comment_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parent_comment_id debe ser un UUID válido"),
];

export const commentUpdateValidator = [
  param("id")
    .isUUID()
    .withMessage("El ID del comentario debe ser un UUID válido"),

  body("comment_text")
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("comment_text debe tener entre 1 y 5000 caracteres"),
];

export const commentListValidator = [
  query("ticketId")
    .optional()
    .isUUID()
    .withMessage("ticketId debe ser un UUID válido"),

  query("parentId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parentId debe ser un UUID válido"),

  query("topLevel")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("topLevel debe ser booleano"),

  query("search")
    .optional()
    .isString()
    .withMessage("search debe ser una cadena"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit debe ser un entero entre 1 y 200"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero >= 0"),

  query("sort")
    .optional()
    .isIn(["createdAt", "updatedAt"])
    .withMessage("sort inválido"),

  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("order debe ser ASC o DESC"),
];
