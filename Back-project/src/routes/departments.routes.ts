import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";
import {
  departmentCreateValidator,
  departmentUpdateValidator,
  departmentListValidator,
  departmentIdParam,
} from "../validators/department.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Gestión de departamentos
 *
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Sistemas"
 *
 *     DepartmentCreateInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Sistemas"
 *
 *     DepartmentUpdateInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Operaciones"
 *
 *     DepartmentListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 2
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Mensaje de error"
 *
 *   parameters:
 *     DepartmentIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: ID del departamento
 *
 *   responses:
 *     NotFound:
 *       description: Recurso no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Conflict:
 *       description: Conflicto por unicidad o FK
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     BadRequest:
 *       description: Petición inválida (validación)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Crear departamento
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentCreateInput'
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  "/",
  authMiddleware,
  departmentCreateValidator,
  validationResultMiddleware,
  DepartmentController.create
);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Listar departamentos
 *     tags: [Departments]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre (ILIKE)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         example: 0
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, id]
 *         example: name
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         example: ASC
 *       - in: query
 *         name: withUsers
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: withTickets
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get(
  "/",
  departmentListValidator,
  authMiddleware,
  validationResultMiddleware,
  DepartmentController.list
);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Obtener departamento por ID
 *     tags: [Departments]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartmentIdParam'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  authMiddleware,
  departmentIdParam,
  validationResultMiddleware,
  DepartmentController.getOne
);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Actualizar departamento
 *     tags: [Departments]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartmentIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentUpdateInput'
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put(
  "/:id",
  authMiddleware,
  departmentIdParam,
  departmentUpdateValidator,
  validationResultMiddleware,
  DepartmentController.update
);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Eliminar departamento
 *     tags: [Departments]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartmentIdParam'
 *     responses:
 *       204:
 *         description: Eliminado sin contenido
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete(
  "/:id",
  authMiddleware,
  departmentIdParam,
  validationResultMiddleware,
  DepartmentController.remove
);

export default router;
