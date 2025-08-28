import { body, param, query } from "express-validator";

export const departmentCreateValidator = [
  body("name")
    .trim()
    .isString()
    .withMessage("El nombre del departamento debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del departamento debe tener entre 1 y 100 caracteres"),
];

export const departmentUpdateValidator = [
  param("id")
    .isInt()
    .withMessage("El ID del departamento debe ser un número entero válido"),

  body("name")
    .trim()
    .isString()
    .withMessage("El nombre del departamento debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del departamento debe tener entre 1 y 100 caracteres"),
];

export const departmentListValidator = [
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
    .isIn(["name"])
    .withMessage("sort inválido"),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("order debe ser ASC o DESC"),
];
