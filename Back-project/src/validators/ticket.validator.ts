import { body, param, query } from "express-validator";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

const norm = (v: unknown) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v;

const nullIfEmpty = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const ALLOWED_SORT = ["titulo", "status", "priority", "createdAt"] as const;
const ALLOWED_ORDER = ["ASC", "DESC"] as const;

export const ticketCreateValidator = [
  body("titulo")
    .customSanitizer(norm)
    .notEmpty()
    .isLength({ min: 3, max: 255 })
    .withMessage("El título debe tener entre 3 y 255 caracteres."),

  body("description")
    .customSanitizer(norm)
    .notEmpty()
    .withMessage("La descripción es obligatoria."),

  body("status")
    .notEmpty()
    .isIn(Object.values(TicketStatus))
    .withMessage("Estado inválido."),

  body("priority")
    .optional({ nullable: true })
    .isIn(Object.values(TicketPriority))
    .withMessage("Prioridad inválida."),

  body("device_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("device_id debe ser entero >= 1 o null.")
    .toInt(),

  body("assigned_user_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("assigned_user_id debe ser UUID o null."),

  body("department_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("department_id debe ser entero >= 1.")
    .toInt(),

  body("parent_ticket_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parent_ticket_id debe ser UUID o null."),

  body("created_by_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("created_by_id debe ser UUID o null."),

  body("created_by_name")
    .optional({ nullable: true })
    .customSanitizer(nullIfEmpty)
    .customSanitizer(norm)
    .isLength({ max: 255 })
    .withMessage("created_by_name no debe exceder 255 caracteres."),

  body("created_by_email")
    .optional({ nullable: true })
    .customSanitizer(nullIfEmpty)
    .isEmail()
    .withMessage("created_by_email debe ser un email válido o null.")
    .normalizeEmail(),
];

export const ticketUpdateValidator = [
  param("id").isUUID().withMessage("El ID del ticket debe ser un UUID válido."),

  body("titulo")
    .optional({ nullable: false })
    .customSanitizer(norm)
    .isLength({ min: 3, max: 255 })
    .withMessage("El título debe tener entre 3 y 255 caracteres."),

  body("description")
    .optional({ nullable: false })
    .customSanitizer(norm)
    .isLength({ min: 1 })
    .withMessage("La descripción no puede ir vacía."),

  body("status")
    .optional({ nullable: false })
    .isIn(Object.values(TicketStatus))
    .withMessage("Estado inválido."),

  body("priority")
    .optional({ nullable: true })
    .isIn(Object.values(TicketPriority))
    .withMessage("Prioridad inválida."),

  body("device_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("device_id debe ser entero >= 1 o null.")
    .toInt(),

  body("assigned_user_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("assigned_user_id debe ser UUID o null."),

  body("department_id")
    .optional({ nullable: false })
    .isInt({ min: 1 })
    .withMessage("department_id debe ser entero >= 1.")
    .toInt(),

  body("parent_ticket_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parent_ticket_id debe ser UUID o null."),
];

export const ticketIdValidator = [
  param("id").isUUID().withMessage("El ID debe ser un UUID válido."),
];

export const ticketListValidator = [
  query("search")
    .optional({ nullable: true })
    .customSanitizer(nullIfEmpty)
    .customSanitizer(norm)
    .isString()
    .withMessage("search debe ser texto."),

  query("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 200 })
    .withMessage("limit debe ser 1..200.")
    .toInt(),

  query("offset")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("offset debe ser >= 0.")
    .toInt(),

  query("sort")
    .optional({ nullable: true })
    .isIn(ALLOWED_SORT as unknown as string[])
    .withMessage("sort inválido."),

  query("order")
    .optional({ nullable: true })
    .customSanitizer((v) =>
      typeof v === "string" ? v.toUpperCase() : v
    )
    .isIn(ALLOWED_ORDER as unknown as string[])
    .withMessage("order debe ser ASC o DESC."),
];
