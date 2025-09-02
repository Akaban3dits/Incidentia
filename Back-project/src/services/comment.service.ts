import { Op } from "sequelize";
import Comment from "../models/comment.model";
import Ticket from "../models/ticket.model";
import User from "../models/user.model";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsParams,
} from "../types/comment.types";
import { NotificationService } from "./notification.service";              
import { NotificationType } from "../enums/notificationType.enum";         

const SORT_MAP: Record<string, string> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

export class CommentService {
  static async create(payload: CreateCommentInput) {
    try {
      const comment_text = payload.comment_text.trim();
      const ticket_id = payload.ticket_id;
      const user_id = payload.user_id;
      const parent_comment_id = payload.parent_comment_id ?? null;

      let parent: Comment | null = null;
      if (parent_comment_id) {
        parent = await Comment.findByPk(parent_comment_id);
        if (!parent) throw new BadRequestError("parent_comment_id no existe.");
        if (parent.ticket_id !== ticket_id) {
          throw new BadRequestError("El comentario padre pertenece a otro ticket.");
        }
      }

      const row = await Comment.create({
        comment_text,
        ticket_id,
        user_id,
        parent_comment_id,
      });

      const ticket = await Ticket.findByPk(ticket_id, {
        attributes: ["ticket_id", "assigned_user_id"],
      });

      const recipients = new Set<string>();
      if (ticket?.assigned_user_id && ticket.assigned_user_id !== user_id) {
        recipients.add(ticket.assigned_user_id);
      }
      if (parent && parent.user_id && parent.user_id !== user_id) {
        recipients.add(parent.user_id);
      }

      if (recipients.size > 0) {
        const short = ticket_id.substring(0, 8);
        const snippet =
          comment_text.length > 120
            ? `${comment_text.slice(0, 117)}…`
            : comment_text;

        await NotificationService.createAndFanout({
          type: NotificationType.Informacion,
          message: parent_comment_id
            ? `Nueva respuesta en el ticket ${short}: "${snippet}"`
            : `Nuevo comentario en el ticket ${short}: "${snippet}"`,
          ticket_id,
          recipients: Array.from(recipients),
        });
      }

      return await Comment.findByPk(row.comment_id, {
        include: [
          { model: User },   
          { model: Ticket }, 
        ],
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;

      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "ticket_id") throw new BadRequestError("FK inválida: ticket_id no existe.");
        if (col === "user_id") throw new BadRequestError("FK inválida: user_id no existe.");
        if (col === "parent_comment_id") throw new BadRequestError("FK inválida: parent_comment_id no existe.");
        throw new BadRequestError("FK inválida en el comentario.");
      }

      throw new InternalServerError("Error al crear el comentario.");
    }
  }

  static async findById(id: string) {
    const row = await Comment.findByPk(id, {
      include: [{ model: User }, { model: Ticket }],
    });
    if (!row) throw new NotFoundError(`Comentario con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListCommentsParams = {}) {
    try {
      const {
        ticketId,
        parentId,
        topLevel = false,
        search = "",
        limit = 20,
        offset = 0,
        sort = "createdAt",
        order = "ASC",
      } = params;

      const where: any = {};
      if (ticketId) where.ticket_id = ticketId;

      if (parentId !== undefined) {
        where.parent_comment_id = parentId;
      } else if (topLevel) {
        where.parent_comment_id = null;
      }

      if (search.trim()) {
        where.comment_text = { [Op.iLike]: `%${search.trim()}%` };
      }

      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "DESC" ? "DESC" : "ASC";

      return await Comment.findAndCountAll({
        where,
        include: [{ model: User }],
        limit,
        offset,
        order: [[sortCol, sortDir]],
      });
    } catch {
      throw new InternalServerError("Error al obtener los comentarios.");
    }
  }

  static async update(id: string, payload: UpdateCommentInput) {
    try {
      const row = await this.findById(id);

      if (payload.comment_text !== undefined) {
        const text = payload.comment_text.trim();
        if (!text) throw new BadRequestError("comment_text no puede estar vacío.");
        row.comment_text = text;
      }

      await row.save();
      return await this.findById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al actualizar el comentario.");
    }
  }

  static async delete(id: string) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Error al eliminar el comentario.");
    }
  }
}
