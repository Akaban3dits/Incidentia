import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, InternalServerError, NotFoundError } from "../utils/error";
import { UserService } from "../services/user.service";

/**
 * Controlador para manejar operaciones relacionadas con usuarios.
 * 
 * Este controlador delega la lógica de negocio al `UserService`
 * y gestiona el flujo de solicitudes y respuestas HTTP.
 */
export class UserController {

  /**
   * Completa el perfil de un usuario existente.
   * 
   * Flujo:
   * 1. Obtiene el `id` del usuario desde los parámetros de la URL.
   * 2. Obtiene los datos del perfil desde el cuerpo de la petición.
   * 3. Llama al servicio `UserService.completeUserProfile` para actualizar la información.
   * 4. Si no se encuentra el usuario, devuelve un `NotFoundError`.
   * 5. Si la operación es exitosa, responde con un mensaje y los datos actualizados.
   * 6. Si ocurre un error inesperado, devuelve un `InternalServerError`.
   */
  static async completeProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {  
    const userId = req.params.id;   // ID del usuario a actualizar
    const profileData = req.body;   // Datos nuevos del perfil

    try {
      // Llamada al servicio para completar el perfil
      const updatedUser = await UserService.completeUserProfile(
        userId,
        profileData
      );

      // Si no se encuentra el usuario, error 404 controlado
      if (!updatedUser) {
        return next(new NotFoundError("Usuario no encontrado"));
      }

      // Respuesta exitosa
      res.json({
        message: "Perfil completado exitosamente",
        user: updatedUser,
      });
    } catch (error) {
      // Manejo genérico de errores inesperados
      next(new InternalServerError("Error al completar el perfil"));
    }
  }
}
