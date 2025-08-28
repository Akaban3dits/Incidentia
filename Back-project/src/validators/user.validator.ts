import { body, param } from "express-validator";
import { CompanyType } from "../enums/companyType.enum";

export const userIdParam = [
  param("userId").isUUID().withMessage("El ID de usuario debe ser un UUID válido"),
];

export const userCreateValidator = [
  body("first_name")
    .trim().isString().isLength({ min: 1, max: 50 })
    .withMessage("first_name es requerido (1-50)"),
  body("last_name")
    .trim().isString().isLength({ min: 1, max: 50 })
    .withMessage("last_name es requerido (1-50)"),
  body("email")
    .trim().isEmail()
    .withMessage("email inválido"),
  body("password")
    .isString().isLength({ min: 6, max: 100 })
    .withMessage("password debe tener entre 6 y 100 caracteres"),
  body("phone_number")
    .optional().isString().isLength({ min: 7, max: 20 })
    .withMessage("phone_number inválido"),
];

export const userCompleteProfileValidator = [
  param("userId")
    .isUUID()
    .withMessage("El ID de usuario debe ser un UUID válido"),

  body("phone_number")
    .optional().isString().isLength({ min: 7, max: 20 })
    .withMessage("phone_number inválido"),

  body("password")
    .optional().isString().isLength({ min: 6, max: 100 })
    .withMessage("password debe tener entre 6 y 100 caracteres"),

  body("department_id")
    .optional().isInt()
    .withMessage("department_id debe ser un entero válido"),

  body("company")
    .optional().isIn(Object.values(CompanyType))
    .withMessage("company inválido"),
];
