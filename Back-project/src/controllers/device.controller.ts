import { Request, Response, NextFunction } from "express";
import { DeviceService } from "../services/device.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceService.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DeviceService.findAll(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceService.findById(Number(req.params.id));
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await DeviceService.update(Number(req.params.id), req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DeviceService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
