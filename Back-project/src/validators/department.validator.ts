import { body, param, query } from "express-validator";

const collapseSpaces = (v: string) => v.replace(/\s+/g, " ");

export const departmentCreateValidator = [
  body("name")
    .isString().withMessage("El nombre del departamento debe ser texto")
    .trim()
    .customSanitizer(collapseSpaces)
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del departamento debe tener entre 1 y 100 caracteres")
    .matches(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/)
    .withMessage("El nombre debe contener al menos una letra (no puede ser solo números)"),
];

export const departmentUpdateValidator = [
  body("name")
    .isString().withMessage("El nombre del departamento debe ser texto")
    .trim()
    .customSanitizer(collapseSpaces)
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del departamento debe tener entre 1 y 100 caracteres")
    .matches(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/)
    .withMessage("El nombre debe contener al menos una letra (no puede ser solo números)"),
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

export const departmentIdParam = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID del departamento debe ser un entero válido")
    .toInt(),
];