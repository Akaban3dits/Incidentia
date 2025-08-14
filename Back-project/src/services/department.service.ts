import { Op } from "sequelize";
import Department from "../models/department.model";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
/**
 * Servicio para manejar la lógica de negocios relacionada con Departamentos.
 * Separa la lógica de la base de datos de los controladores.
 */
export class DepartmentService {
  /**
   * Crea un nuevo departamento.
   * @param department_name Nombre del departamento a crear
   * @returns El departamento creado
   * @throws InternalServerError si ocurre un error de base de datos
   */
  static async createDepartment(department_name: string) {
    try {
      // Verifica existencia de departamento con el mismo nombre
      const existing = await Department.findOne({
        where: { department_name },
      });

      if (existing) {
        // Se recomienda usar un error personalizado en lugar de Error genérico
        throw new ConflictError("El nombre del departamento ya existe.");
      }

      // Crea el departamento en la base de datos
      const department = await Department.create({
        department_name: department_name.trim(), // Elimina espacios al inicio y final
      });

      return department; // Retorna el objeto creado
    } catch (error) {
      // Captura errores inesperados y lanza un error genérico de servidor
      throw new InternalServerError("Error al crear el departamento.");
    }
  }

  /**
   * Busca un departamento por su ID.
   * @param id ID del departamento
   * @returns El departamento encontrado
   * @throws NotFoundError si no existe el departamento
   */
  static async findById(id: string) {
    const department = await Department.findByPk(id);

    if (!department) {
      // Mensaje claro con id incluido para debugging
      throw new NotFoundError(`Departamento con id ${id} no encontrado.`);
    }

    return department;
  }

  /**
   * Obtiene todos los departamentos de la base de datos con:
   * - Paginación: limit y offset
   * - Búsqueda por nombre (insensible a mayúsculas/minúsculas)
   * - Orden ascendente por nombre
   *
   * @param search Texto para filtrar departamentos por nombre
   * @param limit Número máximo de registros a devolver (por defecto 20)
   * @param offset Índice desde donde empezar (útil para paginación)
   * @returns Objeto con { rows, count } donde rows son los departamentos y count el total
   */
  static async findAll({ search = "", limit = 20, offset = 0 }) {
    try {
      // Construye cláusula WHERE si hay texto de búsqueda
      const whereClause = search
        ? {
            department_name: {
              [Op.iLike]: `%${search}%`, // Búsqueda insensible a mayúsculas/minúsculas
            },
          }
        : {};

      // findAndCountAll devuelve filas + total para paginación
      const departments = await Department.findAndCountAll({
        where: whereClause,
        limit, // máximo de registros a devolver
        offset, // paginación
        order: [["department_name", "ASC"]], // orden ascendente
      });

      return departments; // Muy importante retornar los resultados
    } catch (error) {
      // Lanzar error genérico de servidor si algo falla
      throw new InternalServerError("Error al obtener los departamentos.");
    }
  }

  static async updateDepartment(id: string, department_name: string) {
    try {
      const department = await this.findById(id);

      const existing = await Department.findOne({
        where: {
          department_name,
          department_id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictError("El nombre del departamento ya existe.");
      }

      if (department.department_name !== department_name) {
        department.department_name = department_name;
      }

      await department.save();

      return department;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Error al actualizar el departamento.");
    }
  }

  static async deleteDepartment(id: string) {
    try {
      const department = await this.findById(id); // Verifica existencia

      await department.destroy(); // Intenta eliminar

      return; // Si todo salió bien, no hace falta devolver nada
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error; // Registro no encontrado
      }

      // Manejo de conflictos de eliminación (por ejemplo, restricciones FK)
      if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError(
          "No se puede eliminar el departamento porque tiene registros dependientes."
        );
      }

      // Otros errores inesperados
      throw new InternalServerError("Error al eliminar el departamento.");
    }
  }
}
