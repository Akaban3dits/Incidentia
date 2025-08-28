import { body, param, query } from "express-validator";

export const deviceTypeIdParam = [
  param("id").isInt().withMessage("El ID debe ser un entero válido"),
];

export const deviceTypeCreateValidator = [
  body("name")
    .trim()
    .isString().withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres"),

  body("code")
    .optional({ nullable: true })
    .isString().withMessage("El código debe ser una cadena de texto")
    .isLength({ min: 3, max: 3 }).withMessage("El código debe tener exactamente 3 letras")
    .matches(/^[A-Z]{3}$/).withMessage("El código debe ser solo letras mayúsculas (ej: PER, RED)"),
];

export const deviceTypeUpdateValidator = [
  ...deviceTypeIdParam,

  body("name")
    .trim()
    .isString().withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 }).withMessage("El nombre debe tener entre 1 y 100 caracteres"),

  body("code")
    .optional({ nullable: true })
    .isString().withMessage("El código debe ser una cadena de texto")
    .isLength({ min: 3, max: 3 }).withMessage("El código debe tener exactamente 3 letras")
    .matches(/^[A-Z]{3}$/).withMessage("El código debe ser solo letras mayúsculas (ej: PER, RED)"),
];

export const deviceTypeListValidator = [
  query("search")
    .optional()
    .isString().withMessage("search debe ser una cadena de texto"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage("limit debe ser un entero entre 1 y 200"),

  query("offset")
    .optional()
    .isInt({ min: 0 }).withMessage("offset debe ser un entero mayor o igual a 0"),

  query("sort")
    .optional()
    .isIn(["name", "code"]).withMessage("sort inválido"),

  query("order")
    .optional()
    .isIn(["ASC", "DESC"]).withMessage("order debe ser ASC o DESC"),
];
