import { body } from "express-validator";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import { CompanyType } from "../enums/companyType.enum"; 

export const userCreateValidator = [
  body("first_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),

  body("last_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El apellido debe tener entre 1 y 50 caracteres"),

  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("El correo electrónico debe ser válido"),

  body("password")
    .optional()
    .if(body("provider").not().exists())
    .isLength({ min: 8, max: 20 })
    .withMessage("La contraseña debe tener entre 8 y 20 caracteres"),

  body("phone_number")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("El número de teléfono debe tener entre 10 y 15 caracteres"),
];

export const userUpdateValidator = [
  body("first_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),

  body("last_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El apellido debe tener entre 1 y 50 caracteres"),

  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("El correo electrónico debe ser válido"),

  body("password")
    .optional()
    .if(body("provider").not().exists())
    .isLength({ min: 8, max: 20 })
    .withMessage("La contraseña debe tener entre 8 y 20 caracteres"),

  body("status")
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage("El estado de usuario no es válido"),

  body("company")
    .optional()
    .isIn(Object.values(CompanyType))
    .withMessage("El tipo de empresa no es válido"),

  body("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("El rol de usuario no es válido"),

  body("phone_number")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("El número de teléfono debe tener entre 10 y 15 caracteres"),
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