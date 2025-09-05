import { Router } from "express";
import * as ctrl from "../controllers/ticket.controller";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import {
  ticketCreateValidator,
  ticketUpdateValidator,
  ticketListValidator,
  ticketIdValidator,
} from "../validators/ticket.validator";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestión de tickets
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Crear ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, description, status, department_id]
 *             properties:
 *               titulo: { type: string, example: "Impresora no imprime" }
 *               description: { type: string, example: "Marca atasco de papel" }
 *               status: { type: string, example: "Abierto" }
 *               priority: { type: string, nullable: true, example: "Media" }
 *               device_id: { type: integer, nullable: true }
 *               assigned_user_id: { type: string, format: uuid, nullable: true }
 *               department_id: { type: integer, example: 1 }
 *               parent_ticket_id: { type: string, format: uuid, nullable: true }
 *     responses:
 *       201: { description: Creado }
 *       400: { description: Error de validación }
 */
router.post("/", authMiddleware,ticketCreateValidator, validationResultMiddleware, ctrl.create);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Listar tickets
 *     tags: [Tickets]
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
 *         schema: { type: string, enum: ["titulo","status","priority","createdAt"] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: ["ASC","DESC"] }
 *     responses:
 *       200: { description: OK }
 */
router.get("/", ticketListValidator, validationResultMiddleware, ctrl.list);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Obtener ticket por id
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get("/:id", ticketIdValidator, validationResultMiddleware, ctrl.getOne);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Actualizar ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               priority: { type: string, nullable: true }
 *               device_id: { type: integer, nullable: true }
 *               assigned_user_id: { type: string, format: uuid, nullable: true }
 *               department_id: { type: integer }
 *               parent_ticket_id: { type: string, format: uuid, nullable: true }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Error de validación }
 *       404: { description: No encontrado }
 */
router.put("/:id", ticketUpdateValidator, validationResultMiddleware, ctrl.update);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Eliminar ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Sin contenido }
 *       404: { description: No encontrado }
 */
router.delete("/:id", ticketIdValidator, validationResultMiddleware, ctrl.remove);

export default router;
