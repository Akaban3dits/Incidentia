// src/services/attachment.service.ts
import { Op } from "sequelize";
import Attachment from "../models/attachment.model";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateAttachmentInput,
  UpdateAttachmentInput,
  ListAttachmentsParams,
} from "../types/attachment.types";

const SORT_MAP: Record<string, string> = {
  uploaded_at: "uploaded_at",
  original_filename: "original_filename",
  createdAt: "createdAt",
};

export class AttachmentService {
  static async create(data: CreateAttachmentInput) {
    try {
      const file_path = data.file_path.trim();
      const original_filename = data.original_filename.trim();

      const whereUnique: any = { file_path };
      if (data.ticket_id) whereUnique.ticket_id = data.ticket_id;
      if (data.comment_id) whereUnique.comment_id = data.comment_id;

      const existing = await Attachment.findOne({ where: whereUnique });
      if (existing) {
        throw new ConflictError("Ya existe un adjunto con el mismo file_path en este recurso.");
      }

      const row = await Attachment.create({
        ticket_id: data.ticket_id ?? null,
        comment_id: data.comment_id ?? null,
        file_path,
        original_filename,
        is_image: !!data.is_image,
        uploaded_at: data.uploaded_at ?? new Date(),
      });

      return row;
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;

      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "ticket_id") throw new BadRequestError("FK inválida: ticket_id no existe.");
        if (col === "comment_id") throw new BadRequestError("FK inválida: comment_id no existe.");
        throw new BadRequestError("FK inválida en el adjunto.");
      }
      throw new InternalServerError("Error al crear el adjunto.");
    }
  }

  static async findById(id: string) {
    const row = await Attachment.findByPk(id);
    if (!row) throw new NotFoundError(`Adjunto con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListAttachmentsParams = {}) {
    try {
      const {
        ticketId,
        commentId,
        isImage,
        uploadedFrom,
        uploadedTo,
        search = "",
        limit = 20,
        offset = 0,
        sort = "uploaded_at",
        order = "DESC",
      } = params;

      const sortCol = SORT_MAP[sort] ?? "uploaded_at";
      const sortDir = order === "ASC" ? "ASC" : "DESC";

      const where: any = {};
      if (ticketId) where.ticket_id = ticketId;
      if (commentId) where.comment_id = commentId;
      if (typeof isImage === "boolean") where.is_image = isImage;

      if (uploadedFrom || uploadedTo) {
        where.uploaded_at = {};
        if (uploadedFrom) where.uploaded_at[Op.gte] = uploadedFrom;
        if (uploadedTo) where.uploaded_at[Op.lte] = uploadedTo;
      }

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        where[Op.or] = [
          { original_filename: { [Op.iLike]: s } },
          { file_path: { [Op.iLike]: s } },
        ];
      }

      return Attachment.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortCol, sortDir]],
      });
    } catch {
      throw new InternalServerError("Error al obtener los adjuntos.");
    }
  }

  static async update(id: string, data: UpdateAttachmentInput) {
    try {
      const row = await this.findById(id);

      const patch: any = {};
      if (data.file_path !== undefined) patch.file_path = data.file_path.trim();
      if (data.original_filename !== undefined) patch.original_filename = data.original_filename.trim();
      if (data.is_image !== undefined) patch.is_image = !!data.is_image;

      if (patch.file_path) {
        const whereUnique: any = { file_path: patch.file_path };
        if (row.ticket_id) whereUnique.ticket_id = row.ticket_id;
        if (row.comment_id) whereUnique.comment_id = row.comment_id;

        const dup = await Attachment.findOne({
          where: { ...whereUnique, attachment_id: { [Op.ne]: id } },
        });
        if (dup) throw new ConflictError("Ya existe un adjunto con ese file_path en este recurso.");
      }

      await row.update(patch);
      return row;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Conflicto al actualizar: constraint única violada.");
      }
      throw new InternalServerError("Error al actualizar el adjunto.");
    }
  }

  static async delete(id: string) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("No se puede eliminar el adjunto por dependencias existentes.");
      }
      throw new InternalServerError("Error al eliminar el adjunto.");
    }
  }
}
