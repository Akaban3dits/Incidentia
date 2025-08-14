import { body, param } from "express-validator";

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
    .isUUID()
    .withMessage("El ID del departamento debe ser un UUID válido"),

  body("name")
    .trim()
    .isString()
    .withMessage("El nombre del departamento debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 })
    .withMessage("El nombre del departamento debe tener entre 1 y 100 caracteres"),
];