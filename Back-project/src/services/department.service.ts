import Department from "../models/department.model";
import { InternalServerError, NotFoundError } from "../utils/error";

export class DepartmentService {
  static async createDepartment(department_name: string) {
  try {
    const existing = await Department.findOne({
      where: {
        department_name
      },
    });

    if (existing) {
      throw new Error("El nombre del departamento ya existe.");
    }
    const department = await Department.create({ department_name: department_name.trim() });
    return department;
  } catch (error) {
    throw new InternalServerError("Error al crear el departamento.");
  }
}


  static async findById(id: string) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError(`Departamento con id ${id} no encontrado.`);
    }
    return department;
  }

  static async findAll() {
    return Department.findAll();
  }
}
