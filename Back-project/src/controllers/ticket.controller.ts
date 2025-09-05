import { Request, Response, NextFunction } from "express";
import { TicketService } from "../services/ticket.service";
import { UnauthorizedError } from "../utils/error";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user?.user_id) {
      return next(new UnauthorizedError("Usuario no autenticado."));
    }
    const {
      created_by_id: _ignore1,
      created_by_name: _ignore2,
      created_by_email: _ignore3,
      ...body
    } = req.body;



    const ticket = await TicketService.create({
      ...body,
      created_by_id: user.user_id,
      ...(typeof user.name === "string" ? { created_by_name: user.name } : {}),
      ...(typeof user.email === "string" ? { created_by_email: user.email } : {}),
    });
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
