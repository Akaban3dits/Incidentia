import Ticket from "../models/ticket.model";
import {
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
import { StatusHistoryService } from "./statusHistory.service";
import { NotificationService } from "./notification.service";
import { NotificationType } from "../enums/notificationType.enum";
import { UserRole } from "../enums/userRole.enum";
import { sequelize } from "../config/sequelize";

const SORT_MAP: Record<string, "titulo" | "status" | "priority" | "createdAt"> =
  {
    titulo: "titulo",
    status: "status",
    priority: "priority",
    createdAt: "createdAt",
  } as const;

const shortId = (id: string) => id.substring(0, 8);

async function adminsDeptYSistemas(
  deptId: number,
  includeAssignee?: string | null
): Promise<string[]> {
  const [deptAdmins, sistemasAdmins] = await Promise.all([
    NotificationService.recipientsDeptAdmins(deptId),
    NotificationService.recipientsDeptAllByName("Sistemas", {
      roles: [UserRole.Administrador],
      onlyActive: true,
    }),
  ]);
  const set = new Set<string>([...deptAdmins, ...sistemasAdmins]);
  if (includeAssignee) set.add(includeAssignee);
  return Array.from(set);
}

export class TicketService {
  static async create(payload: CreateTicketInput) {
    if (payload.status === TicketStatus.Cerrado) {
      throw new BadRequestError(
        "No se permite crear un ticket con estado Cerrado."
      );
    }

    try {
      const row = await Ticket.create({
        titulo: payload.titulo,
        description: payload.description,
        status: payload.status,
        priority: payload.priority ?? null,
        device_id: payload.device_id ?? null,
        assigned_user_id: payload.assigned_user_id ?? null,
        department_id: payload.department_id,
        parent_ticket_id: payload.parent_ticket_id ?? null,
        closed_at: null,
        created_by_id: payload.created_by_id ?? null,
        created_by_name: payload.created_by_name ?? null,
        created_by_email: payload.created_by_email ?? null,
      });

      await NotificationService.notifyToDeptByName(
        "Sistemas",
        {
          type: NotificationType.Informacion,
          message: `Nuevo ticket creado (${shortId(row.ticket_id)}).`,
          ticket_id: row.ticket_id,
        },
        { roles: [UserRole.Administrador], onlyActive: true }
      );

      if (!row.assigned_user_id) {
        const recipients = await adminsDeptYSistemas(row.department_id, null);
        if (recipients.length) {
          await NotificationService.createAndFanout({
            type: NotificationType.Advertencia,
            message: `Ticket sin encargado (${shortId(row.ticket_id)}).`,
            ticket_id: row.ticket_id,
            recipients,
          });
        }
      }

      return await Ticket.scope(["withBasics"]).findByPk(row.ticket_id);
    } catch (error: any) {
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "device_id")
          throw new BadRequestError("FK inválida: device_id no existe.");
        if (col === "assigned_user_id")
          throw new BadRequestError("FK inválida: assigned_user_id no existe.");
        if (col === "department_id")
          throw new BadRequestError("FK inválida: department_id no existe.");
        if (col === "parent_ticket_id")
          throw new BadRequestError("FK inválida: parent_ticket_id no existe.");
        throw new BadRequestError("FK inválida en el ticket.");
      }
      throw new InternalServerError("Error al crear el ticket.");
    }
  }

  static async findById(id: string) {
    const row = await Ticket.scope(["withBasics"]).findByPk(id);
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

      const scopes: any[] = ["withBasics"];
      if (search) {
        scopes.push({ method: ["search", search] });
      }
      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await Ticket.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener los tickets.");
    }
  }

  static async update(
  id: string,
  payload: UpdateTicketInput,
  actorUserId?: string
) {
  try {
    const updatedId = await sequelize.transaction(async (t) => {
      const row = await this.findById(id);

      const prevStatus = row.status;
      const prevAssignee = row.assigned_user_id;
      const prevPriority = row.priority;

      if (payload.status !== undefined) row.status = payload.status!;
      if (payload.priority !== undefined) row.priority = payload.priority ?? null;
      if (payload.assigned_user_id !== undefined)
        row.assigned_user_id = payload.assigned_user_id ?? null;

      const statusChanged =
        payload.status !== undefined && payload.status !== prevStatus;

      if (statusChanged) {
        if (payload.status === TicketStatus.Cerrado) {
          row.closed_at = new Date();
        } else if (prevStatus === TicketStatus.Cerrado) {
          row.closed_at = null;
        }
      }

      await row.save({ transaction: t });

      if (statusChanged && actorUserId) {
        const occurredAt = row.updatedAt ?? new Date();
        await StatusHistoryService.logChange(
          row.ticket_id,
          prevStatus,
          row.status,
          actorUserId,
          occurredAt,
          { transaction: t }
        );
      }

      const runAfterCommit: Array<() => Promise<void>> = [];

      const assigneeChanged =
        payload.assigned_user_id !== undefined &&
        payload.assigned_user_id !== prevAssignee;

      if (assigneeChanged && row.assigned_user_id) {
        runAfterCommit.push(async () => {
          await NotificationService.notifyAssignee(row.ticket_id, row.assigned_user_id!);
        });
      }

      const priorityChanged =
        payload.priority !== undefined && payload.priority !== prevPriority;

      if (priorityChanged && row.priority === TicketPriority.Critica) {
        runAfterCommit.push(async () => {
          const recipients = await adminsDeptYSistemas(
            row.department_id,
            row.assigned_user_id ?? null
          );
          await NotificationService.createAndFanout({
            type: NotificationType.Alerta,
            message: `Prioridad CRÍTICA en ticket ${shortId(row.ticket_id)}.`,
            ticket_id: row.ticket_id,
            recipients,
          });
        });
      }

      if (
        statusChanged &&
        prevStatus === TicketStatus.Cerrado &&
        row.status !== TicketStatus.Cerrado
      ) {
        runAfterCommit.push(async () => {
          const recipients = await adminsDeptYSistemas(
            row.department_id,
            row.assigned_user_id ?? null
          );
          await NotificationService.createAndFanout({
            type: NotificationType.Advertencia,
            message: `Ticket reabierto (${shortId(row.ticket_id)}).`,
            ticket_id: row.ticket_id,
            recipients,
          });
        });
      }

      if (statusChanged && row.status === TicketStatus.Cerrado) {
        runAfterCommit.push(async () => {
          const recipients = await adminsDeptYSistemas(
            row.department_id,
            row.assigned_user_id ?? null
          );
          await NotificationService.createAndFanout({
            type: NotificationType.Informacion,
            message: `Ticket cerrado (${shortId(row.ticket_id)}).`,
            ticket_id: row.ticket_id,
            recipients,
          });
        });
      }

      t.afterCommit(async () => {
        for (const job of runAfterCommit) await job();
      });

      return row.ticket_id;
    });
    return await this.findById(updatedId);
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError)
      throw error;
    if (error?.name === "SequelizeForeignKeyConstraintError") {
      const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
      if (col === "device_id")
        throw new BadRequestError("FK inválida: device_id no existe.");
      if (col === "assigned_user_id")
        throw new BadRequestError("FK inválida: assigned_user_id no existe.");
      if (col === "department_id")
        throw new BadRequestError("FK inválida: department_id no existe.");
      if (col === "parent_ticket_id")
        throw new BadRequestError("FK inválida: parent_ticket_id no existe.");
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
