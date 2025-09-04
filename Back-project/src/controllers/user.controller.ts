import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.findById(req.params.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const completeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UserService.completeUserProfile(req.params.userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.searchUsers(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UserService.delete(req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
