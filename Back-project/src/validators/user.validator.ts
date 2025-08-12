import { body } from "express-validator";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import { CompanyType } from "../enums/companyType.enum";

const commonFields = {
  first_name: body("first_name")
    .isString().trim().isLength({ min: 1, max: 50 }),

  last_name: body("last_name")
    .isString().trim().isLength({ min: 1, max: 50 }),

  email: body("email")
    .isEmail().normalizeEmail(),

  password: body("password")
    .isLength({ min: 8, max: 20 }),

  provider: body("provider")
    .optional().isString().trim().isLength({ max: 50 }),

  provider_id: body("provider_id")
    .optional().isString().trim().isLength({ max: 255 }),

  status: body("status")
    .isIn(Object.values(UserStatus)),

  company: body("company")
    .isIn(Object.values(CompanyType)),

  role: body("role")
    .isIn(Object.values(UserRole)),

  phone_number: body("phone_number")
    .optional().isString().trim().isLength({ min: 10, max: 15 })
};

export const userCreateValidator = [
  commonFields.first_name,
  commonFields.last_name,
  commonFields.email,

  body("password")
    .if(body("provider").not().exists())
    .isLength({ min: 8, max: 20 }),

  body("provider_id")
    .if(body("provider").exists())
    .isString().trim().isLength({ max: 255 }),

  commonFields.status,
  commonFields.company,
  commonFields.role,
  commonFields.phone_number
];

export const userUpdateValidator = [
  commonFields.first_name,
  commonFields.last_name,
  commonFields.email,

  body("password")
    .if(body("provider").not().exists())
    .isLength({ min: 8, max: 20 }),

  body("provider_id")
    .if(body("provider").exists())
    .isString().trim().isLength({ max: 255 }),

  commonFields.status,
  commonFields.company,
  commonFields.role,
  commonFields.phone_number
];

export const completeUserProfileValidator = [
  body("phone_number")
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage("Formato de teléfono inválido"),
  
  body("password")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("La contraseña debe tener entre 8 y 20 caracteres"),
  
  body("department_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de departamento debe ser un número positivo"),
  
  body("company")
    .optional()
    .isIn(Object.values(CompanyType))
    .withMessage("Tipo de empresa no válido")
];