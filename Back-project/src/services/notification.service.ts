import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/sequelize";

import Notification from "../models/notification.model";
import NotificationUser from "../models/notificationUser.model";
import User from "../models/user.model";
import Department from "../models/department.model";

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";

import {
  CreateNotificationInput,
  ListNotificationsParams,
  ListUserNotificationsParams,
} from "../types/notification.types";

import { NotificationType } from "../enums/notificationType.enum";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";

const SORT_MAP: Record<string, "createdAt" | "updatedAt" | "notification_id"> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  notification_id: "notification_id",
};

export class NotificationService {
  static async createAndFanout(
    payload: CreateNotificationInput,
    trx?: Transaction
  ) {
    if (!payload.recipients?.length) return null;

    const t = trx ?? (await sequelize.transaction());
    try {
      const notif = await Notification.create(
        {
          type: payload.type,
          message: payload.message.trim(),
          ticket_id: payload.ticket_id ?? null,
        },
        { transaction: t }
      );

      const uniqRecipients = Array.from(new Set(payload.recipients));
      const rows = uniqRecipients.map((user_id) => ({
        notification_id: notif.notification_id,
        user_id,
        read_at: null,
        hidden: false,
      }));

      if (rows.length) {
        await NotificationUser.bulkCreate(rows, {
          transaction: t,
          ignoreDuplicates: true as any,
        });
      }

      if (!trx) await t.commit();

      return await Notification.scope("withRelations").findByPk(
        notif.notification_id
      );
    } catch (error: any) {
      if (!trx) await t.rollback();
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new BadRequestError(
          "FK inválida al crear la notificación o sus destinatarios."
        );
      }
      throw new InternalServerError("Error al crear la notificación.");
    }
  }

  static async findById(id: number) {
    const row = await Notification.scope("withRelations").findByPk(id);
    if (!row) throw new NotFoundError(`Notificación con id ${id} no encontrada.`);
    return row;
  }

  static async findAll(params: ListNotificationsParams = {}) {
    try {
      const {
        ticketId,
        type,
        search = "",
        from,
        to,
        limit = 20,
        offset = 0,
        sort = "createdAt",
        order = "DESC",
      } = params;

      const scopes: any[] = ["withRecipients"];

      if (ticketId) scopes.push({ method: ["byTicket", ticketId] });
      if (type) scopes.push({ method: ["byType", type] });
      if (search.trim()) scopes.push({ method: ["searchMessage", search.trim()] });
      if (from || to) scopes.push({ method: ["betweenCreated", from ?? null, to ?? null] });

      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "ASC" ? "ASC" : "DESC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await Notification.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener notificaciones.");
    }
  }

  static async findForUser(params: ListUserNotificationsParams) {
    try {
      const {
        userId,
        unreadOnly = false,
        hidden,
        type,
        ticketId,
        from,
        to,
        limit = 20,
        offset = 0,
        sort = "createdAt",
        order = "DESC",
      } = params;

      const scopes: any[] = [{ method: ["forRecipient", userId, unreadOnly, hidden] }];

      if (type) scopes.push({ method: ["byType", type] });
      if (ticketId) scopes.push({ method: ["byTicket", ticketId] });
      if (from || to) scopes.push({ method: ["betweenCreated", from ?? null, to ?? null] });

      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "ASC" ? "ASC" : "DESC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await Notification.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener notificaciones del usuario.");
    }
  }

  static async recipientsDeptAll(
    department_id: number,
    opts?: { onlyActive?: boolean; roles?: UserRole[]; excludeUserId?: string }
  ): Promise<string[]> {
    const where: any = { department_id };
    if (opts?.onlyActive) where.status = UserStatus.Activo;
    if (opts?.roles?.length) where.role = { [Op.in]: opts.roles };

    const users = await User.findAll({ where, attributes: ["user_id"] });
    let ids = users.map((u) => u.user_id);

    if (opts?.excludeUserId) {
      ids = ids.filter((id) => id !== opts.excludeUserId);
    }

    return Array.from(new Set(ids));
  }

  static async recipientsDeptAllByName(
    departmentName: string,
    opts?: { onlyActive?: boolean; roles?: UserRole[]; excludeUserId?: string }
  ): Promise<string[]> {
    const dept = await Department.findOne({
      where: { name: { [Op.iLike]: departmentName } },
      attributes: ["id"],
    });
    if (!dept) return [];
    return this.recipientsDeptAll(dept.id, opts);
  }

  static async recipientsDeptAdmins(department_id: number): Promise<string[]> {
    return this.recipientsDeptAll(department_id, {
      roles: [UserRole.Administrador],
      onlyActive: true,
    });
  }
}