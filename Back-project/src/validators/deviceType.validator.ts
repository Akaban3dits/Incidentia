import { body, param, query } from "express-validator";

const CODE_REGEX = /^[A-Z]{3}$/;

export const deviceTypeIdParams = [
  param("id")
    .isInt().withMessage("El ID debe ser un entero válido"),
];

export const deviceTypeCreateValidator = [
  body("name")
    .isString().withMessage("El nombre debe ser texto")
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres"),
  body("code")
    .optional({ nullable: true })
    .customSanitizer(v => (v == null ? v : String(v).trim().toUpperCase()))
    .custom(v => v == null || CODE_REGEX.test(v))
    .withMessage("El código debe ser 3 letras mayúsculas"),
];

export const deviceTypeUpdateBody = [
  body("name")
    .optional()
    .isString().withMessage("El nombre debe ser texto")
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres"),
  body("code")
    .optional({ nullable: true })
    .customSanitizer(v => (v == null ? v : String(v).trim().toUpperCase()))
    .custom(v => v == null || CODE_REGEX.test(v))
    .withMessage("El código debe ser 3 letras mayúsculas"),
];

export const deviceTypeListValidator = [
  query("search").optional().isString().withMessage("search debe ser texto"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit debe ser un entero entre 1 y 200"),
  query("offset").optional().isInt({ min: 0 }).withMessage("offset debe ser un entero >= 0"),
  query("sort").optional().isIn(["name", "code"]).withMessage("sort inválido"),
  query("order").optional().isIn(["ASC", "DESC"]).withMessage("order debe ser ASC o DESC"),
];
