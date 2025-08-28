import { Op } from "sequelize";
import DeviceType from "../models/deviceType.model";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateDeviceTypeInput,
  UpdateDeviceTypeInput,
  ListDeviceTypesParams,
} from "../types/deviceType.types";

const CODE_REGEX = /^[A-Z]{3}$/;

export class DeviceTypeService {
  static async create(payload: CreateDeviceTypeInput) {
    try {
      const name = payload.name?.trim();
      const codeRaw = payload.code?.trim();
      const code = codeRaw ? codeRaw.toUpperCase() : null; 

      if (!name) {
        throw new BadRequestError("El nombre del tipo de dispositivo es obligatorio.");
      }
      if (code && !CODE_REGEX.test(code)) {
        throw new BadRequestError("El código debe tener exactamente 3 letras mayúsculas (ej: PER, RED, OTR).");
      }

      const byName = await DeviceType.findOne({ where: { type_name: name } });
      if (byName) throw new ConflictError("Ya existe un tipo con ese nombre.");

      if (code) {
        const byCode = await DeviceType.findOne({ where: { type_code: code } });
        if (byCode) throw new ConflictError("Ya existe un tipo con ese código.");
      }

      const row = await DeviceType.create({
        type_name: name,
        type_code: code,
      });

      return row;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El código de tipo ya está en uso.");
      }
      throw new InternalServerError("Error al crear el tipo de dispositivo.");
    }
  }

  // READ by id (int)
  static async findById(id: number) {
    if (id === undefined || id === null || Number.isNaN(Number(id))) {
      throw new BadRequestError("El ID del tipo de dispositivo es obligatorio y debe ser numérico.");
    }

    const row = await DeviceType.findByPk(Number(id));
    if (!row) throw new NotFoundError(`Tipo de dispositivo con id ${id} no encontrado.`);
    return row;
  }

  // LIST
  static async findAll(params: ListDeviceTypesParams = {}) {
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

      const where = search.trim()
        ? {
            [Op.or]: [
              { type_name: { [Op.iLike]: `%${search.trim()}%` } }, 
              { type_code: { [Op.iLike]: `%${search.trim()}%` } },
            ],
          }
        : {};

      const sortMap: Record<string, string> = { name: "type_name", code: "type_code" };
      const sortCol = sortMap[sort] || "type_name";

      return DeviceType.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortCol, order]],
      });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al obtener los tipos de dispositivo.");
    }
  }

  // UPDATE
  static async update(id: number, payload: UpdateDeviceTypeInput) {
    try {
      const name = payload.name?.trim();
      const codeRaw = payload.code?.trim();
      const code = codeRaw ? codeRaw.toUpperCase() : null; 

      if (!name) {
        throw new BadRequestError("El nombre del tipo de dispositivo es obligatorio.");
      }

      // Validación de code (si viene)
      if (code && !CODE_REGEX.test(code)) {
        throw new BadRequestError("El código debe tener exactamente 3 letras mayúsculas (ej: PER, RED, OTR).");
      }

      const row = await this.findById(id);

      const byName = await DeviceType.findOne({
        where: { type_name: name, device_type_id: { [Op.ne]: Number(id) } },
      });
      if (byName) throw new ConflictError("Ya existe un tipo con ese nombre.");

      if (code) {
        const byCode = await DeviceType.findOne({
          where: { type_code: code, device_type_id: { [Op.ne]: Number(id) } },
        });
        if (byCode) throw new ConflictError("Ya existe un tipo con ese código.");
      }

      row.type_name = name;
      row.type_code = code;
      await row.save();

      return row;
    } catch (error: any) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof BadRequestError
      ) throw error;

      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El código de tipo ya está en uso.");
      }

      throw new InternalServerError("Error al actualizar el tipo de dispositivo.");
    }
  }

  // DELETE
  static async delete(id: number) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("No se puede eliminar: hay dispositivos asociados a este tipo.");
      }
      throw new InternalServerError("Error al eliminar el tipo de dispositivo.");
    }
  }
}
