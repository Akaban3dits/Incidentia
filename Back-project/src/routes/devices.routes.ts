import { Router } from "express";
import * as ctrl from "../controllers/device.controller";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import {
  deviceCreateValidator,
  deviceUpdateValidator,
  deviceIdParam,
  deviceListValidator,
} from "../validators/device.validator";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Gestión de dispositivos
 *
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         device_id: { type: integer }
 *         device_name: { type: string }
 *         device_type_id: { type: integer }
 *         deviceType:
 *           type: object
 *           properties:
 *             device_type_id: { type: integer }
 *             type_name: { type: string }
 *             type_code: { type: string, nullable: true }
 *     DeviceCreateInput:
 *       type: object
 *       required: [name, deviceTypeId]
 *       properties:
 *         name: { type: string, example: "PC-01" }
 *         deviceTypeId: { type: integer, example: 1 }
 *     DeviceListResponse:
 *       type: object
 *       properties:
 *         count: { type: integer }
 *         rows:
 *           type: array
 *           items: { $ref: '#/components/schemas/Device' }
 */

/**
 * @swagger
 * /api/devices:
 *   post:
 *     tags: [Devices]
 *     summary: Crear dispositivo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeviceCreateInput' }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Device' }
 *       400: { description: Error de validación o FK inválida }
 *       409: { description: Nombre duplicado }
 */
router.post("/", authMiddleware, deviceCreateValidator, validationResultMiddleware, ctrl.create);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     tags: [Devices]
 *     summary: Listar dispositivos
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: deviceTypeId
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [name, id] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC] }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DeviceListResponse' }
 */
router.get("/", authMiddleware, deviceListValidator, validationResultMiddleware, ctrl.list);

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     tags: [Devices]
 *     summary: Obtener dispositivo por ID
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
 *             schema: { $ref: '#/components/schemas/Device' }
 *       404: { description: No encontrado }
 */
router.get("/:id", authMiddleware,deviceIdParam, validationResultMiddleware, ctrl.getOne);

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     tags: [Devices]
 *     summary: Actualizar dispositivo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeviceCreateInput' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Device' }
 *       400: { description: Error de validación o FK inválida }
 *       404: { description: No encontrado }
 *       409: { description: Nombre duplicado }
 */
router.put("/:id", authMiddleware,deviceUpdateValidator, validationResultMiddleware, ctrl.update);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     tags: [Devices]
 *     summary: Eliminar dispositivo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminado }
 *       404: { description: No encontrado }
 *       409: { description: Conflicto por dependencias (FK) }
 */
router.delete("/:id", authMiddleware,deviceIdParam, validationResultMiddleware, ctrl.remove);

export default router;
