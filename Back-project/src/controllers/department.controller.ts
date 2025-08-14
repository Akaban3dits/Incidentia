import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "../services/department.service";
import { InternalServerError, NotFoundError } from "../utils/error";

export class DepartmentController {
  /**
   * Crea un nuevo departamento.
   * - Extrae el nombre del departamento del body.
   * - Llama al servicio para crear el registro.
   * - Devuelve 201 con los datos del departamento creado.
   * - Maneja errores controlados y errores inesperados.
   */
  static async createDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { name } = req.body; // Nombre enviado por el cliente

    try {
      const department = await DepartmentService.createDepartment(name);

      res.status(201).json({
        message: "Departamento creado exitosamente",
        department,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      next(new InternalServerError("Error al crear el departamento"));
    }
  }

  /**
   * Obtiene todos los departamentos con soporte de búsqueda y paginación.
   * - Extrae search, limit y offset desde query.
   * - Llama al servicio que devuelve { rows, count }.
   * - Devuelve los resultados en un objeto JSON.
   */
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const departments = await DepartmentService.findAll({ search, limit, offset });

      res.status(200).json({
        message: "Departamentos obtenidos exitosamente",
        departments,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      next(new InternalServerError("Error al obtener los departamentos"));
    }
  }

  /**
   * Obtiene un departamento por su ID.
   * - Extrae el id desde params.
   * - Llama al servicio para buscar el departamento.
   * - Devuelve 200 con el departamento encontrado.
   * - Si no existe, propaga NotFoundError.
   */
  static async getDepartmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    try {
      const department = await DepartmentService.findById(id);

      res.status(200).json({
        message: "Departamento obtenido exitosamente",
        department,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      next(new InternalServerError("Error al obtener el departamento"));
    }
  }

  /**
   * Actualiza un departamento existente.
   * - Extrae id desde params y nuevo nombre desde body.
   * - Llama al servicio para actualizar el registro.
   * - Devuelve 200 con los datos actualizados.
   * - Maneja errores de existencia y otros errores inesperados.
   */
  static async updateDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const updatedDepartment = await DepartmentService.updateDepartment(id, name);

      res.status(200).json({
        message: "Departamento actualizado exitosamente",
        department: updatedDepartment,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return next(error);
      } 
      next(new InternalServerError("Error al actualizar el departamento"));
    }
  }

  /** 
   * Elimina un departamento.
   * - Extrae id desde params.
   * - Llama al servicio para eliminar el registro.
   * - Devuelve 204 si la eliminación fue exitosa.
   * - Captura errores de inexistencia y conflictos por dependencias.
   */
  static async deleteDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    try {
      await DepartmentService.deleteDepartment(id);

      res.status(204).send(); // No devuelve contenido
    } catch (error) {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      next(new InternalServerError("Error al eliminar el departamento"));
    }
  }
}
