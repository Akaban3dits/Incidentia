import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "../services/department.service";
import { InternalServerError, NotFoundError } from "../utils/error";

export class DepartmentController {
    static async createDepartment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { name } = req.body;

        try {
            const department = await DepartmentService.createDepartment(name);
            res.status(201).json({
                message: "Departamento creado exitosamente",
                department,
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                return next(error);
            }
            next(new InternalServerError("Error al crear el departamento"));
        }
    }
}
