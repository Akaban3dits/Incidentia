import { Op } from "sequelize";
import Task, { TaskOrderableCol } from "../models/task.model";
import Ticket from "../models/ticket.model";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksParams,
} from "../types/task.types";

const SORT_MAP: Record<string, TaskOrderableCol> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  completed_at: "completed_at",
  task_description: "task_description",
  is_completed: "is_completed",
};

export class TaskService {
  static async create(payload: CreateTaskInput) {
    try {
      const task_description = payload.task_description.trim();
      const ticket_id = payload.ticket_id;
      const is_completed = !!payload.is_completed;

      const row = await Task.create({
        task_description,
        ticket_id,
        is_completed,
        completed_at: is_completed ? new Date() : null,
      });

      return await Task.findByPk(row.task_id, {
        include: [{ model: Ticket, as: "ticket" }],
      });
    } catch (error: any) {
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        const col = error?.fields ? Object.keys(error.fields)[0] : undefined;
        if (col === "ticket_id") {
          throw new BadRequestError("FK inválida: ticket_id no existe.");
        }
        throw new BadRequestError("FK inválida en la tarea.");
      }
      throw new InternalServerError("Error al crear la tarea.");
    }
  }

  static async findById(id: number) {
    const row = await Task.findByPk(id, {
      include: [{ model: Ticket, as: "ticket" }],
    });
    if (!row) throw new NotFoundError(`Tarea con id ${id} no encontrada.`);
    return row;
  }

  static async findAll(params: ListTasksParams = {}) {
    try {
      const {
        ticketId,
        isCompleted,
        search = "",
        completedFrom,
        completedTo,
        limit = 20,
        offset = 0,
        sort = "createdAt",
        order = "ASC",
      } = params;

      const scopes: any[] = ["withTicket"];

      if (ticketId) scopes.push({ method: ["byTicket", ticketId] });
      if (typeof isCompleted === "boolean")
        scopes.push({ method: ["completed", isCompleted] });
      if (search.trim()) scopes.push({ method: ["search", search] });
      if (completedFrom || completedTo)
        scopes.push({ method: ["completedBetween", completedFrom ?? null, completedTo ?? null] });

      const sortCol = SORT_MAP[sort] ?? "createdAt";
      const sortDir = order === "DESC" ? "DESC" : "ASC";
      scopes.push({ method: ["orderBy", sortCol, sortDir] });

      return await Task.scope(scopes).findAndCountAll({
        limit,
        offset,
      });
    } catch {
      throw new InternalServerError("Error al obtener las tareas.");
    }
  }

  static async update(id: number, payload: UpdateTaskInput) {
    try {
      const row = await this.findById(id);

      if (payload.task_description !== undefined) {
        const desc = payload.task_description.trim();
        if (!desc) throw new BadRequestError("task_description no puede estar vacío.");
        row.task_description = desc;
      }

      if (payload.is_completed !== undefined) {
        const to = !!payload.is_completed;
        if (to && !row.is_completed) {
          row.is_completed = true;
          row.completed_at = new Date();
        } else if (!to && row.is_completed) {
          row.is_completed = false;
          row.completed_at = null;
        }
      }

      await row.save();
      return await this.findById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new BadRequestError("FK inválida en la tarea.");
      }
      throw new InternalServerError("Error al actualizar la tarea.");
    }
  }

  static async delete(id: number) {
    try {
      const row = await this.findById(id);
      await row.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Error al eliminar la tarea.");
    }
  }
}
