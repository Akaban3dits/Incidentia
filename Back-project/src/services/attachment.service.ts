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

export class AttachmentService {
  static async create(data: CreateAttachmentInput) {
    try {
      if (!data.ticket_id) throw new BadRequestError("El ticket_id es obligatorio.");
      if (!data.file_path?.trim()) throw new BadRequestError("El file_path es obligatorio.");
      if (!data.original_filename?.trim())
        throw new BadRequestError("El original_filename es obligatorio.");

      const existing = await Attachment.findOne({
        where: { ticket_id: data.ticket_id, file_path: data.file_path.trim() },
      });
      if (existing) {
        throw new ConflictError("Ya existe un adjunto con el mismo file_path para este ticket.");
      }

      const row = await Attachment.create({
        ticket_id: data.ticket_id,
        file_path: data.file_path.trim(),
        original_filename: data.original_filename.trim(),
        is_image: data.is_image ?? false,
        uploaded_at: data.uploaded_at ?? new Date(),
      });

      return row;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new BadRequestError("FK inválida: ticket_id no existe.");
      }
      throw new InternalServerError("Error al crear el adjunto.");
    }
  }

  static async findById(id: string) {
    if (!id) throw new BadRequestError("El ID del adjunto es obligatorio.");
    const row = await Attachment.findByPk(id);
    if (!row) throw new NotFoundError(`Adjunto con id ${id} no encontrado.`);
    return row;
  }

  static async findAll(params: ListAttachmentsParams = {}) {
    try {
      const {
        ticketId,
        search = "",
        limit = 20,
        offset = 0,
        sort = "uploaded_at",
        order = "DESC",
      } = params;

      if (limit <= 0 || offset < 0) {
        throw new BadRequestError("Parámetros de paginación inválidos.");
      }

      const where: any = {};
      if (ticketId) where.ticket_id = ticketId;
      if (search.trim()) where.original_filename = { [Op.iLike]: `%${search.trim()}%` };

      return Attachment.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sort, order]],
      });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al obtener los adjuntos.");
    }
  }

  static async update(id: string, data: UpdateAttachmentInput) {
    try {
      if (!id) throw new BadRequestError("El ID del adjunto es obligatorio.");
      const row = await this.findById(id);

      const patch: any = {};
      if (data.file_path !== undefined) {
        if (!data.file_path.trim()) throw new BadRequestError("file_path no puede ser vacío.");
        patch.file_path = data.file_path.trim();
      }
      if (data.original_filename !== undefined) {
        if (!data.original_filename.trim())
          throw new BadRequestError("original_filename no puede ser vacío.");
        patch.original_filename = data.original_filename.trim();
      }
      if (data.is_image !== undefined) patch.is_image = !!data.is_image;

      await row.update(patch);
      return row;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Conflicto al actualizar: constraint única violada.");
      }
      throw new InternalServerError("Error al actualizar el adjunto.");
    }
  }

  static async delete(id: string) {
    try {
      if (!id) throw new BadRequestError("El ID del adjunto es obligatorio.");
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("No se puede eliminar el adjunto por dependencias existentes.");
      }
      throw new InternalServerError("Error al eliminar el adjunto.");
    }
  }
}
