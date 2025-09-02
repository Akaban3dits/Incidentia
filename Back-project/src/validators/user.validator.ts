// src/validators/user.validator.ts
import { body, param } from "express-validator";
import { CompanyType } from "../enums/companyType.enum";

const collapseSpaces = (v: any) =>
  typeof v === "string" ? v.replace(/\s+/g, " ") : v;

const sanitizePhone = (v: any) =>
  typeof v === "string" ? v.replace(/[\s()-]/g, "") : v;

export const userIdParam = [
  param("userId")
    .isUUID()
    .withMessage("El ID de usuario debe ser un UUID válido"),
];

export const userCreateValidator = [
  body("first_name")
    .trim()
    .customSanitizer(collapseSpaces)
    .isLength({ min: 1, max: 50 })
    .withMessage("first_name es requerido (1-50 caracteres)"),

  body("last_name")
    .trim()
    .customSanitizer(collapseSpaces)
    .isLength({ min: 1, max: 50 })
    .withMessage("last_name es requerido (1-50 caracteres)"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("email inválido"),

  body("password")
    .trim()
    .isLength({ min: 6, max: 100 })
    .withMessage("password debe tener entre 6 y 100 caracteres"),

  body("phone_number")
    .optional()
    .customSanitizer(sanitizePhone)
    .matches(/^\+?[0-9]{7,20}$/)
    .withMessage("phone_number inválido, solo dígitos y opcional '+' inicial"),
];

export const userCompleteProfileValidator = [
  param("userId")
    .isUUID()
    .withMessage("El ID de usuario debe ser un UUID válido"),

  body("phone_number")
    .optional()
    .customSanitizer(sanitizePhone)
    .matches(/^\+?[0-9]{7,20}$/)
    .withMessage("phone_number inválido, solo dígitos y opcional '+' inicial"),

  body("password")
    .optional()
    .trim()
    .isLength({ min: 6, max: 100 })
    .withMessage("password debe tener entre 6 y 100 caracteres"),

  body("department_id")
    .customSanitizer((v) => (v === "null" ? null : v))
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("department_id debe ser null o un entero >= 1"),

  body("company")
    .optional()
    .isIn(Object.values(CompanyType))
    .withMessage("company inválido"),
];
