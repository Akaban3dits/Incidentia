import { body, param } from "express-validator";
import { CompanyType } from "../enums/companyType.enum";
import { query } from "express-validator";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";

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

  body("email").trim().toLowerCase().normalizeEmail().isEmail().withMessage("email inválido"),

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

export const userSearchValidator = [
  query("q").optional().isString().withMessage("q debe ser texto"),
  query("department_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("department_id debe ser entero >= 1"),
  query("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("role inválido"),
  query("status")
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage("status inválido"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page debe ser entero >= 1"),
  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("pageSize entre 1 y 200"),
  query("recent")
    .optional()
    .isBoolean()
    .withMessage("recent debe ser boolean")
    .toBoolean(),
];
