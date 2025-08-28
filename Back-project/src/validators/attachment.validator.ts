import { body, param, query } from "express-validator";

export const attachmentIdParam = [
  param("attachmentId")
    .isUUID()
    .withMessage("El ID del adjunto debe ser un UUID válido"),
];

export const attachmentCreateValidator = [
  param("ticketId")
    .isUUID()
    .withMessage("El ID del ticket debe ser un UUID válido"),

  body("file_path")
    .trim()
    .isString()
    .withMessage("El file_path debe ser una cadena de texto")
    .isLength({ min: 1, max: 500 })
    .withMessage("El file_path no puede estar vacío"),

  body("original_filename")
    .trim()
    .isString()
    .withMessage("El nombre de archivo original debe ser una cadena de texto")
    .isLength({ min: 1, max: 255 })
    .withMessage("El original_filename no puede estar vacío"),

  body("is_image")
    .optional()
    .isBoolean()
    .withMessage("is_image debe ser booleano"),

  body("uploaded_at")
    .optional()
    .isISO8601()
    .withMessage("uploaded_at debe ser una fecha válida (ISO 8601)"),
];

export const attachmentUpdateValidator = [
  param("attachmentId")
    .isUUID()
    .withMessage("El ID del adjunto debe ser un UUID válido"),

  body("file_path")
    .optional()
    .trim()
    .isString()
    .withMessage("El file_path debe ser una cadena de texto")
    .isLength({ min: 1, max: 500 })
    .withMessage("file_path no puede estar vacío"),

  body("original_filename")
    .optional()
    .trim()
    .isString()
    .withMessage("El original_filename debe ser una cadena de texto")
    .isLength({ min: 1, max: 255 })
    .withMessage("original_filename no puede estar vacío"),

  body("is_image")
    .optional()
    .isBoolean()
    .withMessage("is_image debe ser booleano"),
];

export const attachmentListValidator = [
  query("ticketId")
    .optional()
    .isUUID()
    .withMessage("ticketId debe ser un UUID válido"),

  query("search")
    .optional()
    .isString()
    .withMessage("search debe ser una cadena de texto"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit debe ser un entero entre 1 y 200"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a 0"),

  query("sort")
    .optional()
    .isIn(["uploaded_at", "original_filename"])
    .withMessage("sort inválido"),

  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("order debe ser ASC o DESC"),
];
