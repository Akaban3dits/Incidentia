import { Request, Response, NextFunction } from "express";
import { TicketService } from "../services/ticket.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await TicketService.create(req.body);
    return res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, limit, offset, sort, order } = req.query as any;
    const result = await TicketService.findAll({
      search,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      sort,
      order,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await TicketService.findById(req.params.id);
    return res.json(row);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorUserId = (req as any).user?.user_id;
    const row = await TicketService.update(req.params.id, req.body, actorUserId);
    return res.json(row);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[TicketController.remove] id =", req.params.id);
    await TicketService.delete(req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    console.log("[TicketController.remove] error ->", {
      name: err?.name,
      message: err?.message,
      statusCode: err?.statusCode,
    });
    next(err);
  }
};
