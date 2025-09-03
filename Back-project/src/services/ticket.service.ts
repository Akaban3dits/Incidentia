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

const SORT_MAP: Record<string, "titulo" | "status" | "priority" | "createdAt"> = {
  titulo: "titulo",
  status: "status",
  priority: "priority",
  createdAt: "createdAt",
};

export class TicketService {
  static async create(payload: CreateTicketInput) {
    try {
      const closedAt =
        payload.status === TicketStatus.Cerrado ? new Date() : null;

      const row = await Ticket.create({
        titulo: payload.titulo.trim(),
        description: payload.description.trim(),
        status: payload.status,
        priority: payload.priority ?? null,
        device_id: payload.device_id ?? null,
        assigned_user_id: payload.assigned_user_id ?? null,
        department_id: payload.department_id,
        parent_ticket_id: payload.parent_ticket_id ?? null,
        closed_at: closedAt,
      });

      await NotificationService.notifyToDeptByName(
        "Sistemas",
        {
          type: NotificationType.Informacion,
          message: `Nuevo ticket creado (${row.ticket_id.substring(0, 8)}).`,
          ticket_id: row.ticket_id,
        },
        { roles: [UserRole.Administrador], onlyActive: true }
      );

      if (!row.assigned_user_id) {
        const [deptAdmins, sistemasAdmins] = await Promise.all([
          NotificationService.recipientsDeptAdmins(row.department_id),
          NotificationService.recipientsDeptAllByName("Sistemas", {
            roles: [UserRole.Administrador],
            onlyActive: true,
          }),
        ]);
        const recipients = Array.from(new Set([...deptAdmins, ...sistemasAdmins]));
        if (recipients.length) {
          await NotificationService.createAndFanout({
            type: NotificationType.Advertencia,
            message: `Ticket sin encargado (${row.ticket_id.substring(0, 8)}).`,
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
      if (search.trim()) {
        scopes.push({ method: ["search", search.trim()] });
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

  static async update(id: string, payload: UpdateTicketInput, actorUserId?: string) {
    try {
      const row = await this.findById(id);

      if (
        payload.parent_ticket_id !== undefined &&
        payload.parent_ticket_id === id
      ) {
        throw new BadRequestError("parent_ticket_id no puede ser el mismo ticket.");
      }

      const prevStatus = row.status;
      const prevAssignee = row.assigned_user_id;
      const prevPriority = row.priority;
      const prevDeptId = row.department_id;

      if (payload.titulo !== undefined) row.titulo = payload.titulo.trim();
      if (payload.description !== undefined) row.description = payload.description.trim();
      if (payload.status !== undefined) row.status = payload.status as TicketStatus;
      if (payload.priority !== undefined) row.priority = (payload.priority ?? null) as TicketPriority | null;
      if (payload.device_id !== undefined) row.device_id = payload.device_id ?? null;
      if (payload.assigned_user_id !== undefined) row.assigned_user_id = payload.assigned_user_id ?? null;
      if (payload.department_id !== undefined) row.department_id = payload.department_id;
      if (payload.parent_ticket_id !== undefined) row.parent_ticket_id = payload.parent_ticket_id ?? null;

      const statusChanged = payload.status !== undefined && payload.status !== prevStatus;
      if (statusChanged) {
        if (payload.status === TicketStatus.Cerrado) {
          row.closed_at = new Date();
        } else if (prevStatus === TicketStatus.Cerrado) {
          row.closed_at = null;
        }
      }

      await row.save();

      if (statusChanged && actorUserId) {
        await StatusHistoryService.logChange(
          row.ticket_id,
          prevStatus,
          row.status,
          actorUserId,
          new Date()
        );
      }

      const assigneeChanged =
        payload.assigned_user_id !== undefined &&
        payload.assigned_user_id !== prevAssignee;
      if (assigneeChanged && row.assigned_user_id) {
        await NotificationService.notifyAssignee(row.ticket_id, row.assigned_user_id);
      }

      const priorityChanged =
        payload.priority !== undefined && payload.priority !== prevPriority;
      if (priorityChanged && row.priority === TicketPriority.Critica) {
        const [deptAdmins, sistemasAdmins] = await Promise.all([
          NotificationService.recipientsDeptAdmins(row.department_id),
          NotificationService.recipientsDeptAllByName("Sistemas", {
            roles: [UserRole.Administrador],
            onlyActive: true,
          }),
        ]);
        const recipients = new Set<string>([...deptAdmins, ...sistemasAdmins]);
        if (row.assigned_user_id) recipients.add(row.assigned_user_id);

        await NotificationService.createAndFanout({
          type: NotificationType.Alerta,
          message: `Prioridad CRÍTICA en ticket ${row.ticket_id.substring(0, 8)}.`,
          ticket_id: row.ticket_id,
          recipients: Array.from(recipients),
        });
      }

      if (
        statusChanged &&
        prevStatus === TicketStatus.Cerrado &&
        row.status !== TicketStatus.Cerrado
      ) {
        const [deptAdmins, sistemasAdmins] = await Promise.all([
          NotificationService.recipientsDeptAdmins(row.department_id),
          NotificationService.recipientsDeptAllByName("Sistemas", {
            roles: [UserRole.Administrador],
            onlyActive: true,
          }),
        ]);
        const recipients = new Set<string>([...deptAdmins, ...sistemasAdmins]);
        if (row.assigned_user_id) recipients.add(row.assigned_user_id);

        await NotificationService.createAndFanout({
          type: NotificationType.Advertencia,
          message: `Ticket reabierto (${row.ticket_id.substring(0, 8)}).`,
          ticket_id: row.ticket_id,
          recipients: Array.from(recipients),
        });
      }

      if (statusChanged && row.status === TicketStatus.Cerrado) {
        const deptAdmins = await NotificationService.recipientsDeptAdmins(row.department_id);
        const recipients = new Set<string>(deptAdmins);
        if (row.assigned_user_id) recipients.add(row.assigned_user_id);

        await NotificationService.createAndFanout({
          type: NotificationType.Informacion,
          message: `Ticket cerrado (${row.ticket_id.substring(0, 8)}).`,
          ticket_id: row.ticket_id,
          recipients: Array.from(recipients),
        });
      }

      const deptChanged =
        payload.department_id !== undefined &&
        payload.department_id !== prevDeptId;
      if (deptChanged) {
        const newAdmins = await NotificationService.recipientsDeptAdmins(row.department_id);
        if (newAdmins.length) {
          await NotificationService.createAndFanout({
            type: NotificationType.Informacion,
            message: `Ticket movido de departamento.`,
            ticket_id: row.ticket_id,
            recipients: newAdmins,
          });
        }
      }

      return await this.findById(id);
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
