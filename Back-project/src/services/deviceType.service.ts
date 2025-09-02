import { Op } from "sequelize";
import DeviceType from "../models/deviceType.model";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateDeviceTypeInput,
  UpdateDeviceTypeInput,
  ListDeviceTypesParams,
} from "../types/deviceType.types";

const normName = (s: string) => s.trim().replace(/\s+/g, " ");
const normCode = (s?: string | null) =>
  s === undefined ? undefined : (s === null ? null : s.trim().toUpperCase());

const SORT_MAP: Record<string, "type_name" | "type_code"> = {
  name: "type_name",
  code: "type_code",
};

export class DeviceTypeService {
  static async create(payload: CreateDeviceTypeInput) {
    try {
      const name = normName(payload.name);
      const code = normCode(payload.code) ?? null;

      const byName = await DeviceType.scope({ method: ["byName", name] }).findOne();
      if (byName) throw new ConflictError("Ya existe un tipo con ese nombre.");

      if (code) {
        const byCode = await DeviceType.scope({ method: ["byCode", code] }).findOne();
        if (byCode) throw new ConflictError("Ya existe un tipo con ese código.");
      }

      return await DeviceType.create({ type_name: name, type_code: code });
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El nombre o el código ya está en uso.");
      }
      throw new InternalServerError("Error al crear el tipo de dispositivo.");
    }
  }

  static async findById(id: number) {
    const row = await DeviceType.findByPk(Number(id));
    if (!row) throw new NotFoundError(`Tipo de dispositivo con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListDeviceTypesParams = {}) {
    try {
      const {
        search = "",
        limit = 20,
        offset = 0,
        sort = "name",
        order = "ASC",
      } = params;

      const scopes: any[] = [];
      if (search.trim()) scopes.push({ method: ["search", search.trim()] });

      const sortCol = SORT_MAP[sort] ?? "type_name";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await DeviceType.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener los tipos de dispositivo.");
    }
  }

  static async update(id: number, payload: UpdateDeviceTypeInput) {
    try {
      const row = await this.findById(id);

      if (payload.name !== undefined) {
        const name = normName(payload.name);
        const byName = await DeviceType.findOne({
          where: { type_name: name, device_type_id: { [Op.ne]: Number(id) } },
        });
        if (byName) throw new ConflictError("Ya existe un tipo con ese nombre.");
        row.type_name = name;
      }

      if (Object.prototype.hasOwnProperty.call(payload, "code")) {
        const code = normCode(payload.code) ?? null;
        if (code) {
          const byCode = await DeviceType.findOne({
            where: { type_code: code, device_type_id: { [Op.ne]: Number(id) } },
          });
          if (byCode) throw new ConflictError("Ya existe un tipo con ese código.");
        }
        row.type_code = code;
      }

      await row.save();
      return row;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El nombre o el código ya está en uso.");
      }
      throw new InternalServerError("Error al actualizar el tipo de dispositivo.");
    }
  }

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
