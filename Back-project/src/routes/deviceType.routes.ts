import { Router } from "express";
import * as ctrl from "../controllers/deviceType.controller";
import {
  deviceTypeCreateValidator,
  deviceTypeUpdateBody,
  deviceTypeListValidator,
  deviceTypeIdParams,
} from "../validators/deviceType.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DeviceTypes
 *   description: Gestión de tipos de dispositivos
 *
 * components:
 *   schemas:
 *     DeviceType:
 *       type: object
 *       properties:
 *         device_type_id:
 *           type: integer
 *         type_name:
 *           type: string
 *         type_code:
 *           type: string
 *           nullable: true
 *     DeviceTypeCreateInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Laptop"
 *         code:
 *           type: string
 *           nullable: true
 *           example: "LPT"
 *     DeviceTypeListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeviceType'
 */

/**
 * @swagger
 * /api/device-types:
 *   post:
 *     tags: [DeviceTypes]
 *     summary: Crear un tipo de dispositivo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceTypeCreateInput'
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceType'
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Conflicto (nombre o código duplicado)
 */
router.post(
  "/",
  deviceTypeCreateValidator,
  validationResultMiddleware,
  ctrl.create
);

/**
 * @swagger
 * /api/device-types:
 *   get:
 *     tags: [DeviceTypes]
 *     summary: Listar tipos de dispositivo
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name, code] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC] }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceTypeListResponse'
 */
router.get("/", deviceTypeListValidator, validationResultMiddleware, ctrl.list);

/**
 * @swagger
 * /api/device-types/{id}:
 *   get:
 *     tags: [DeviceTypes]
 *     summary: Obtener un tipo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceType'
 *       404:
 *         description: No encontrado
 */
router.get("/:id", deviceTypeIdParams, validationResultMiddleware, ctrl.getOne);

/**
 * @swagger
 * /api/device-types/{id}:
 *   put:
 *     tags: [DeviceTypes]
 *     summary: Actualizar un tipo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceTypeCreateInput'
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceType'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Conflicto (nombre o código duplicado)
 */
router.put(
  "/:id",
  deviceTypeIdParams,
  deviceTypeUpdateBody,
  validationResultMiddleware,
  ctrl.update
);

/**
 * @swagger
 * /api/device-types/{id}:
 *   delete:
 *     tags: [DeviceTypes]
 *     summary: Eliminar un tipo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Conflicto por dependencias (FK)
 */
router.delete(
  "/:id",
  deviceTypeIdParams,
  validationResultMiddleware,
  ctrl.remove
);

export default router;
