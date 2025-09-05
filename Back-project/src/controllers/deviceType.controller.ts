import { Request, Response, NextFunction } from "express";
import { DeviceTypeService } from "../services/deviceType.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceTypeService.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DeviceTypeService.findAll(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceTypeService.findById(Number(req.params.id));
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceTypeService.update(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DeviceTypeService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
