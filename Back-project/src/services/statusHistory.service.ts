import StatusHistory from "../models/statusHistory.model";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateStatusHistoryInput,
  UpdateStatusHistoryInput,
  ListStatusHistoryParams,
} from "../types/statusHistory.types";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { Transaction } from "sequelize";

const SORT_MAP: Record<string, "changed_at" | "createdAt" | "updatedAt"> = {
  changed_at: "changed_at",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

export class StatusHistoryService {
  static async create(
    payload: CreateStatusHistoryInput,
    options?: { transaction?: Transaction }
  ) {
    try {
      const {
        ticket_id,
        old_status,
        new_status,
        changed_by_user_id,
        changed_at,
      } = payload;

      if (old_status === new_status) {
        throw new BadRequestError("old_status y new_status no pueden ser iguales.");
      }

      const row = await StatusHistory.create(
        {
          ticket_id,
          old_status,
          new_status,
          changed_by_user_id,
          changed_at: changed_at ? new Date(changed_at) : new Date(),
        },
        { transaction: options?.transaction }
      );

      return await StatusHistory.scope("withRelations").findByPk(row.history_id);
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;

      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "ticket_id")
          throw new BadRequestError("FK inválida: ticket_id no existe.");
        if (col === "changed_by_user_id")
          throw new BadRequestError("FK inválida: changed_by_user_id no existe.");
        throw new BadRequestError("FK inválida en status_history.");
      }

      throw new InternalServerError("Error al crear el historial de estado.");
    }
  }

  static async logChange(
    ticket_id: string,
    from: TicketStatus,
    to: TicketStatus,
    changed_by_user_id: string,
    when?: Date | string,
    options?: { transaction?: Transaction }
  ) {
    return this.create(
      {
        ticket_id,
        old_status: from,
        new_status: to,
        changed_by_user_id,
        changed_at: when,
      },
      options
    );
  }

  static async findById(id: number) {
    const row = await StatusHistory.scope("withRelations").findByPk(id);
    if (!row) throw new NotFoundError(`Historial con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListStatusHistoryParams = {}) {
    try {
      const {
        ticketId,
        changedBy,
        from,
        to,
        oldStatus,
        newStatus,
        limit = 20,
        offset = 0,
        sort = "changed_at",
        order = "ASC",
      } = params;

      const scopes: any[] = ["withChangedByUser"];

      if (ticketId) scopes.push({ method: ["byTicket", ticketId] });
      if (changedBy) scopes.push({ method: ["byUser", changedBy] });
      if (oldStatus) scopes.push({ method: ["oldStatus", oldStatus] });
      if (newStatus) scopes.push({ method: ["newStatus", newStatus] });
      if (from || to) scopes.push({ method: ["between", from ?? null, to ?? null] });

      const sortCol = SORT_MAP[sort] ?? "changed_at";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await StatusHistory.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener el historial de estados.");
    }
  }
}
