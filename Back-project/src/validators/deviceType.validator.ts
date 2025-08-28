import { body, param, query } from "express-validator";

const CODE_REGEX = /^[A-Z]{3}$/;

export const deviceTypeCreateValidator = [
  body("name").trim().isLength({ min: 1, max: 100 }),
  body("code").optional({ nullable: true }).isString().trim()
    .customSanitizer(v => (v == null ? v : String(v).toUpperCase()))
    .matches(CODE_REGEX).withMessage("El código debe ser 3 letras mayúsculas"),
];

export const deviceTypeUpdateValidator = [
  param("id").isInt(),
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("code").optional({ nullable: true })
    .customSanitizer(v => (v == null ? v : String(v).toUpperCase()))
    .matches(CODE_REGEX).withMessage("El código debe ser 3 letras mayúsculas"),
];

export const deviceTypeListValidator = [
  query("search").optional().isString(),
  query("limit").optional().isInt({ min: 1, max: 200 }),
  query("offset").optional().isInt({ min: 0 }),
  query("sort").optional().isIn(["name", "code"]),
  query("order").optional().isIn(["ASC", "DESC"]),
];
