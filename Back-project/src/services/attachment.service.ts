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

const SORT_MAP: Record<string, "uploaded_at" | "createdAt" | "original_filename"> = {
  uploaded_at: "uploaded_at",
  original_filename: "original_filename",
  createdAt: "createdAt",
};

export class AttachmentService {
  static async create(data: CreateAttachmentInput, _opts?: { actorUserId?: string }) {
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

      return await Attachment.scope(["withTicket", "withComment"]).findByPk(row.attachment_id);
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;

      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "ticket_id") throw new BadRequestError("FK inválida: ticket_id no existe.");
        if (col === "comment_id") throw new BadRequestError("FK inválida: comment_id no existe.");
        throw new BadRequestError("FK inválida en el adjunto.");
      }
      if (error?.message?.includes("exclusivamente")) {
        throw new BadRequestError("Debe asociarse exactamente a ticket o comentario (no ambos).");
      }
      throw new InternalServerError("Error al crear el adjunto.");
    }
  }

  static async findById(id: string) {
    const row = await Attachment.scope(["withTicket", "withComment"]).findByPk(id);
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

      const scopes: any[] = [];

      if (ticketId) scopes.push({ method: ["byTicket", ticketId] });
      if (commentId) scopes.push({ method: ["byComment", commentId] });

      if (typeof isImage === "boolean") scopes.push({ method: ["isImage", isImage] });

      if (uploadedFrom || uploadedTo)
        scopes.push({ method: ["uploadedBetween", uploadedFrom, uploadedTo] });

      if (search.trim()) scopes.push({ method: ["search", search.trim()] });

      const sortCol = SORT_MAP[sort] ?? "uploaded_at";
      const sortDir = order === "ASC" ? "ASC" : "DESC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return Attachment.scope(scopes).findAndCountAll({
        limit,
        offset,
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
      return await this.findById(id);
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
