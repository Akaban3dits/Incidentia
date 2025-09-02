import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/error";

export const validationResultMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next(new BadRequestError(firstError.msg));
  }

  next();
};
