import { Op } from "sequelize";
import Ticket from "../models/ticket.model";
import Device from "../models/device.model";
import User from "../models/user.model";
import Department from "../models/department.model";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "../utils/error";
import {
  CreateTicketInput,
  UpdateTicketInput,
  ListTicketsParams,
} from "../types/ticket.types";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

const SORT_MAP: Record<string, string> = {
  titulo: "titulo",
  status: "status",
  priority: "priority",
  createdAt: "createdAt",
};

export class TicketService {
  // CREATE (asume que el validator ya garantizó campos obligatorios y enums)
  static async create(payload: CreateTicketInput) {
    try {
      const row = await Ticket.create({
        titulo: payload.titulo.trim(),
        description: payload.description.trim(),
        status: payload.status,
        priority: payload.priority ?? null,
        device_id: payload.device_id ?? null,
        assigned_user_id: payload.assigned_user_id ?? null,
        department_id: payload.department_id,
        parent_ticket_id: payload.parent_ticket_id ?? null,
      });

      // Devolver con includes útiles
      return await Ticket.findByPk(row.ticket_id, {
        include: [
          { model: Device, as: "device" },
          { model: User, as: "assignedUser" },
          { model: Department, as: "department" },
        ],
      });
    } catch (error: any) {
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "device_id") throw new BadRequestError("FK inválida: device_id no existe.");
        if (col === "assigned_user_id") throw new BadRequestError("FK inválida: assigned_user_id no existe.");
        if (col === "department_id") throw new BadRequestError("FK inválida: department_id no existe.");
        if (col === "parent_ticket_id") throw new BadRequestError("FK inválida: parent_ticket_id no existe.");
        throw new BadRequestError("FK inválida en el ticket.");
      }
      throw new InternalServerError("Error al crear el ticket.");
    }
  }

  static async findById(id: string) {
    const row = await Ticket.findByPk(id, {
      include: [
        { model: Device, as: "device" },
        { model: User, as: "assignedUser" },
        { model: Department, as: "department" },
      ],
    });
    if (!row) throw new NotFoundError(`Ticket con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListTicketsParams = {}) {
    try {
      const {
        search = "",
        limit = 20,
        offset = 0,
        sort = "createdAt",
        order = "ASC",
      } = params;

      const where =
        search.trim()
          ? {
              [Op.or]: [
                { titulo: { [Op.iLike]: `%${search.trim()}%` } },
                { description: { [Op.iLike]: `%${search.trim()}%` } },
              ],
            }
          : {};

      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "DESC" ? "DESC" : "ASC";

      return await Ticket.findAndCountAll({
        where,
        include: [
          { model: Device, as: "device" },
          { model: User, as: "assignedUser" },
          { model: Department, as: "department" },
        ],
        limit,
        offset,
        order: [[sortCol, sortDir]],
      });
    } catch {
      throw new InternalServerError("Error al obtener los tickets.");
    }
  }

  static async update(id: string, payload: UpdateTicketInput) {
    try {
      const row = await this.findById(id);

      if (payload.titulo !== undefined) row.titulo = payload.titulo.trim();
      if (payload.description !== undefined) row.description = payload.description.trim();
      if (payload.status !== undefined) row.status = payload.status as TicketStatus;
      if (payload.priority !== undefined) row.priority = (payload.priority ?? null) as TicketPriority | null;
      if (payload.device_id !== undefined) row.device_id = payload.device_id ?? null;
      if (payload.assigned_user_id !== undefined) row.assigned_user_id = payload.assigned_user_id ?? null;
      if (payload.department_id !== undefined) row.department_id = payload.department_id;
      if (payload.parent_ticket_id !== undefined) row.parent_ticket_id = payload.parent_ticket_id ?? null;

      if (payload.status !== undefined) {
        if (payload.status === TicketStatus.Cerrado && !row.closed_at) {
          row.closed_at = new Date();
        } else if (payload.status !== TicketStatus.Cerrado && row.closed_at) {
          row.closed_at = null;
        }
      }

      await row.save();

      return await this.findById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "device_id") throw new BadRequestError("FK inválida: device_id no existe.");
        if (col === "assigned_user_id") throw new BadRequestError("FK inválida: assigned_user_id no existe.");
        if (col === "department_id") throw new BadRequestError("FK inválida: department_id no existe.");
        if (col === "parent_ticket_id") throw new BadRequestError("FK inválida: parent_ticket_id no existe.");
        throw new BadRequestError("FK inválida en el ticket.");
      }
      throw new InternalServerError("Error al actualizar el ticket.");
    }
  }

  static async delete(id: string) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Error al eliminar el ticket.");
    }
  }
}
