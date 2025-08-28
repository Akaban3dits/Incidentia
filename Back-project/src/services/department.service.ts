import { Op } from "sequelize";
import Department from "../models/department.model";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "../utils/error";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  ListDepartmentsParams,
} from "../types/department.types";

export class DepartmentService {
  // CREATE
  static async createDepartment(payload: CreateDepartmentInput) {
    try {
      const name = payload.name?.trim();
      if (!name) throw new BadRequestError("El nombre del departamento es obligatorio.");

      const existing = await Department.findOne({ where: { name } });
      if (existing) throw new ConflictError("El nombre del departamento ya existe.");

      const department = await Department.create({ name });
      return department;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al crear el departamento.");
    }
  }

  // READ by ID
  static async findById(id: number) {
    if (id === undefined || id === null || Number.isNaN(Number(id))) {
      throw new BadRequestError("El ID del departamento es obligatorio y debe ser numérico.");
    }

    const department = await Department.findByPk(Number(id));
    if (!department) throw new NotFoundError(`Departamento con id ${id} no encontrado.`);

    return department;
  }

  // LIST
  static async findAll(params: ListDepartmentsParams = {}) {
    try {
      const {
        search = "",
        limit = 20,
        offset = 0,
        sort = "name",
        order = "ASC",
      } = params;

      if (limit <= 0 || offset < 0) {
        throw new BadRequestError("Parámetros de paginación inválidos.");
      }

      const whereClause = search.trim()
        ? { name: { [Op.iLike]: `%${search.trim()}%` } } // Si usas MySQL, cambia a Op.like
        : {};

      const departments = await Department.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [[sort, order]],
      });

      return departments;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al obtener los departamentos.");
    }
  }

  // UPDATE
  static async updateDepartment(id: number, payload: UpdateDepartmentInput) {
    try {
      const name = payload.name?.trim();
      if (!name) throw new BadRequestError("El nombre del departamento es obligatorio.");

      const department = await this.findById(id);

      const existing = await Department.findOne({
        where: {
          name,
          id: { [Op.ne]: Number(id) },
        },
      });
      if (existing) throw new ConflictError("El nombre del departamento ya existe.");

      department.name = name;
      await department.save();

      return department;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new InternalServerError("Error al actualizar el departamento.");
    }
  }

  // DELETE
  static async deleteDepartment(id: number) {
    try {
      const department = await this.findById(id);
      await department.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;

      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError(
          "No se puede eliminar el departamento porque tiene registros dependientes."
        );
      }
      throw new InternalServerError("Error al eliminar el departamento.");
    }
  }
}
