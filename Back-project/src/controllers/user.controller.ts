import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, InternalServerError, NotFoundError } from "../utils/error";
import { UserService } from "../services/user.service";

export class UserController {
  static async completeProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {  
    const userId = req.params.id;
    const profileData = req.body;

    try {
      const updatedUser = await UserService.completeUserProfile(
        userId,
        profileData
      );
      if (!updatedUser) {
        return next(new NotFoundError("Usuario no encontrado"));
      }
      res.json({
        message: "Perfil completado exitosamente",
        user: updatedUser,
      });
    } catch (error) {
      next(new InternalServerError("Error al completar el perfil"));
    }
  }
}
