import { Router } from "express";
import { departmentCreateValidator, departmentUpdateValidator } from "../validators/department.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import { DepartmentController } from "../controllers/department.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Endpoints para la gestión de departamentos
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Lista todos los departamentos
 *     description: Retorna un listado de todos los departamentos, opcionalmente filtrados por búsqueda.
 *     tags: [Departments]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto para filtrar los departamentos por nombre
 *     responses:
 *       200:
 *         description: Lista de departamentos obtenida exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/departments", DepartmentController.getDepartments);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Obtiene un departamento por ID
 *     description: Retorna la información de un departamento específico por su ID.
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento encontrado.
 *       404:
 *         description: Departamento no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/departments/:id", DepartmentController.getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Crea un nuevo departamento
 *     description: Registra un nuevo departamento. El nombre debe ser único.
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_name
 *             properties:
 *               department_name:
 *                 type: string
 *                 example: Sistemas
 *     responses:
 *       201:
 *         description: Departamento creado exitosamente.
 *       400:
 *         description: Error de validación.
 *       409:
 *         description: Conflicto. Ya existe un departamento con ese nombre.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/departments",
  departmentCreateValidator,
  validationResultMiddleware,
  DepartmentController.createDepartment
);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Actualiza un departamento existente
 *     description: Modifica el nombre de un departamento por ID. El nuevo nombre debe ser único.
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_name
 *             properties:
 *               department_name:
 *                 type: string
 *                 example: Recursos Humanos
 *     responses:
 *       200:
 *         description: Departamento actualizado exitosamente.
 *       400:
 *         description: Error de validación.
 *       404:
 *         description: Departamento no encontrado.
 *       409:
 *         description: Conflicto. Ya existe un departamento con ese nombre.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  "/departments/:id",
  departmentUpdateValidator,
  validationResultMiddleware,
  DepartmentController.updateDepartment
);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Elimina un departamento
 *     description: Elimina un departamento por ID. Si está en uso, devolverá un conflicto.
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del departamento
 *     responses:
 *       204:
 *         description: Departamento eliminado exitosamente (sin contenido).
 *       404:
 *         description: Departamento no encontrado.
 *       409:
 *         description: No se puede eliminar el departamento porque está en uso.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete("/departments/:id", DepartmentController.deleteDepartment);

export default router;
