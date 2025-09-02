import Department from "../models/department.model";
import { Op } from "sequelize";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  ListDepartmentsParams,
} from "../types/department.types";

const norm = (s: string) => s.trim().replace(/\s+/g, " ");
const SORT_MAP: Record<string, "name" | "id"> = { name: "name", id: "id" };

export class DepartmentService {
  static async createDepartment(payload: CreateDepartmentInput) {
    try {
      const name = norm(payload.name);

      const existing = await Department.findOne({ where: { name } });
      if (existing) throw new ConflictError("El nombre del departamento ya existe.");

      return await Department.create({ name });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El nombre del departamento ya existe.");
      }
      throw new InternalServerError("Error al crear el departamento.");
    }
  }

  static async findById(id: number) {
    const department = await Department.findByPk(id);
    if (!department) throw new NotFoundError(`Departamento con id ${id} no encontrado.`);
    return department;
  }

  static async findAll(params: ListDepartmentsParams = {}) {
    try {
      const {
        search = "",
        limit = 20,
        offset = 0,
        sort = "name",
        order = "ASC", 
        withUsers = false,
        withTickets = false,
      } = params as ListDepartmentsParams & {
        withUsers?: boolean;
        withTickets?: boolean;
      };

      const scopes: any[] = [];

      if (search.trim()) scopes.push({ method: ["search", search.trim()] });

      const sortCol = SORT_MAP[sort] ?? "name";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      if (withUsers) scopes.push("withUsers");
      if (withTickets) scopes.push("withTickets");

      return await Department.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener los departamentos.");
    }
  }

  static async updateDepartment(id: number, payload: UpdateDepartmentInput) {
    try {
      const department = await this.findById(id);
      const name = norm(payload.name);

      const existing = await Department.findOne({
        where: { name, id: { [Op.ne]: id } },
      });
      if (existing) throw new ConflictError("El nombre del departamento ya existe.");

      department.name = name;
      await department.save();
      return department;
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El nombre del departamento ya existe.");
      }
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Error al actualizar el departamento.");
    }
  }

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
