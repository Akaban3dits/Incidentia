import { body, param, query } from "express-validator";

export const deviceIdParam = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número válido."),
];

export const deviceCreateValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del dispositivo es obligatorio.")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres."),
  body("deviceTypeId")
    .notEmpty()
    .withMessage("El tipo de dispositivo es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El ID de tipo de dispositivo debe ser un número válido.")
    .toInt(),
];

export const deviceUpdateValidator = [
  ...deviceIdParam,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres."),
  body("deviceTypeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de tipo de dispositivo debe ser un número válido.")
    .toInt(),
];

export const deviceListValidator = [
  query("search").optional().isString().withMessage("search debe ser texto."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit debe ser 1..200."),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser >= 0."),
  query("sort").optional().isIn(["name", "id"]).withMessage("sort inválido."),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("order debe ser ASC o DESC."),
  query("deviceTypeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("deviceTypeId debe ser entero >= 1.")
    .toInt(),
];
