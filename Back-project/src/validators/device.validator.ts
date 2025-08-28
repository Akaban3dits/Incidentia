// src/validators/device.validator.ts
import { body, param, query } from "express-validator";

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
    .withMessage("El ID de tipo de dispositivo debe ser un número válido."),
];

export const deviceUpdateValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número válido."),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres."),
  body("deviceTypeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de tipo de dispositivo debe ser un número válido."),
];

export const deviceIdValidator = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número válido."),
];

export const deviceListValidator = [
  query("search").optional().isString().withMessage("El parámetro de búsqueda debe ser texto."),
  query("limit").optional().isInt({ min: 1 }).withMessage("El límite debe ser un número positivo."),
  query("offset").optional().isInt({ min: 0 }).withMessage("El offset debe ser un número válido."),
  query("sort")
    .optional()
    .isIn(["name", "id"])
    .withMessage("El campo de ordenamiento no es válido."),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("El orden debe ser ASC o DESC."),
];
