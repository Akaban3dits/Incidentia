import { Router } from "express";
import * as ctrl from "../controllers/user.controller";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import {
  userIdParam,
  userCreateValidator,
  userCompleteProfileValidator,
  userSearchValidator,
} from "../validators/user.validator";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id: { type: string, format: uuid }
 *         first_name: { type: string }
 *         last_name: { type: string }
 *         email: { type: string, format: email }
 *         phone_number: { type: string, nullable: true }
 *         status: { type: string }
 *         company: { type: string }
 *         role: { type: string }
 *         provider: { type: string, nullable: true }
 *         provider_id: { type: string, nullable: true }
 *         department_id: { type: integer, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateUserInput:
 *       type: object
 *       required: [first_name, last_name, email, password]
 *       properties:
 *         first_name: { type: string, example: "Juan" }
 *         last_name: { type: string, example: "Pérez" }
 *         email: { type: string, example: "juan@example.com" }
 *         password: { type: string, example: "secreto123" }
 *         phone_number: { type: string, nullable: true, example: "+521234567890" }
 *     CompleteProfileInput:
 *       type: object
 *       properties:
 *         phone_number: { type: string, nullable: true, example: "+521234567890" }
 *         password: { type: string, example: "nuevoPass123" }
 *         department_id: { type: integer, nullable: true, example: 3 }
 *         company: { type: string, example: "Externa" }
 *     UserListResponse:
 *       type: object
 *       properties:
 *         count: { type: integer }
 *         rows:
 *           type: array
 *           items: { $ref: '#/components/schemas/User' }
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario (email/password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserInput' }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Error de validación }
 *       409: { description: Email duplicado }
 */
router.post("/", userCreateValidator, validationResultMiddleware, ctrl.create);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Buscar/listar usuarios
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: department_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 200 }
 *       - in: query
 *         name: recent
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserListResponse' }
 */
router.get("/", userSearchValidator, validationResultMiddleware, ctrl.search);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404: { description: No encontrado }
 */
router.get("/:userId", userIdParam, validationResultMiddleware, ctrl.getOne);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     tags: [Users]
 *     summary: Completar/actualizar perfil
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CompleteProfileInput' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Error de validación }
 *       404: { description: No encontrado }
 *       409: { description: Conflicto en campos únicos }
 */
router.put(
  "/:userId/profile",
  userCompleteProfileValidator,
  validationResultMiddleware,
  ctrl.completeProfile
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario por ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Eliminado }
 *       400: { description: ID inválido }
 *       404: { description: No encontrado }
 *       409: { description: Conflicto por dependencias (FK) }
 */
router.delete(
  "/:userId",
  userIdParam,
  validationResultMiddleware,
  ctrl.remove
);

export default router;
