import { Op } from "sequelize";
import Device from "../models/device.model";
import DeviceType from "../models/deviceType.model";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "../utils/error";
import {
  CreateDeviceInput,
  UpdateDeviceInput,
  ListDevicesParams,
} from "../types/device.types";

const SORT_MAP: Record<string, "device_name" | "device_id"> = {
  name: "device_name",
  id: "device_id",
};
const norm = (s: string) => s.trim().replace(/\s+/g, " ");

export class DeviceService {
  static async create(payload: CreateDeviceInput) {
    const name = norm(payload.name);
    const deviceTypeId = Number(payload.deviceTypeId);
    if (!Number.isInteger(deviceTypeId) || deviceTypeId < 1) {
      throw new BadRequestError("deviceTypeId debe ser un entero >= 1.");
    }

    const dt = await DeviceType.findByPk(deviceTypeId);
    if (!dt) throw new BadRequestError("FK inválida: deviceTypeId no existe.");

    const exists = await Device.findOne({ where: { device_name: name } });
    if (exists)
      throw new ConflictError("Ya existe un dispositivo con ese nombre.");

    try {
      const created = await Device.create({
        device_name: name,
        device_type_id: deviceTypeId,
      });
      return await Device.scope("withType").findByPk(created.device_id);
    } catch (error: any) {
      if (
        error?.name === "SequelizeUniqueConstraintError" ||
        error?.original?.code === "23505"
      ) {
        throw new ConflictError("Ya existe un dispositivo con ese nombre.");
      }
      if (
        error?.name === "SequelizeForeignKeyConstraintError" ||
        error?.original?.code === "23503"
      ) {
        throw new BadRequestError("FK inválida: deviceTypeId no existe.");
      }
      throw new InternalServerError("Error al crear el dispositivo.");
    }
  }

  static async findById(id: number) {
    const row = await Device.scope("withType").findByPk(id);
    if (!row)
      throw new NotFoundError(`Dispositivo con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListDevicesParams = {}) {
    try {
      const {
        search = "",
        limit = 20,
        offset = 0,
        sort = "name",
        order = "ASC",
        deviceTypeId,
      } = params;

      const scopes: any[] = ["withType"];
      if (search.trim()) scopes.push({ method: ["search", search.trim()] });

      const typeFilter =
        deviceTypeId !== undefined ? Number(deviceTypeId) : undefined;
      if (Number.isInteger(typeFilter)) {
        scopes.push({ method: ["byTypeId", typeFilter] });
      }

      const sortCol = SORT_MAP[sort] ?? "device_name";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await Device.scope(scopes).findAndCountAll({ limit, offset });
    } catch {
      throw new InternalServerError("Error al obtener los dispositivos.");
    }
  }

  static async update(id: number, payload: UpdateDeviceInput) {
    const row = await this.findById(id);

    if (payload.name !== undefined) {
      const name = norm(payload.name);
      const byName = await Device.findOne({
        where: { device_name: name, device_id: { [Op.ne]: id } },
      });
      if (byName)
        throw new ConflictError("Ya existe un dispositivo con ese nombre.");
      row.device_name = name;
    }

    if (payload.deviceTypeId !== undefined) {
      const newTypeId = Number(payload.deviceTypeId);
      if (!Number.isInteger(newTypeId) || newTypeId < 1) {
        throw new BadRequestError("deviceTypeId debe ser un entero >= 1.");
      }
      const dt = await DeviceType.findByPk(newTypeId);
      if (!dt)
        throw new BadRequestError("FK inválida: deviceTypeId no existe.");
      row.device_type_id = newTypeId;
    }

    try {
      await row.save();
      return await Device.scope("withType").findByPk(row.device_id);
    } catch (error: any) {
      if (
        error?.name === "SequelizeUniqueConstraintError" ||
        error?.original?.code === "23505"
      ) {
        throw new ConflictError("Ya existe un dispositivo con ese nombre.");
      }
      if (
        error?.name === "SequelizeForeignKeyConstraintError" ||
        error?.original?.code === "23503"
      ) {
        throw new BadRequestError("FK inválida: deviceTypeId no existe.");
      }
      throw new InternalServerError("Error al actualizar el dispositivo.");
    }
  }

  static async delete(id: number) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError(
          "No se puede eliminar: hay tickets asociados a este dispositivo."
        );
      }
      throw new InternalServerError("Error al eliminar el dispositivo.");
    }
  }
}
