import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "../services/department.service";

export class DepartmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const row = await DepartmentService.createDepartment(req.body);
      return res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const row = await DepartmentService.findById(id);
      return res.json(row);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, limit, offset, sort, order, withUsers, withTickets } = req.query;

      const result = await DepartmentService.findAll({
        search: (search as string) ?? "",
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        sort: (sort as "name") ?? "name",
        order: (order as "ASC" | "DESC") ?? "ASC",
        ...(withUsers ? { withUsers: String(withUsers) === "true" } : {}),
        ...(withTickets ? { withTickets: String(withTickets) === "true" } : {}),
      });

      return res.json({
        count: result.count,
        rows: result.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const row = await DepartmentService.updateDepartment(id, req.body);
      return res.json(row);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentService.deleteDepartment(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
