import { Router } from "express";
import { departmentCreateValidator } from "../validators/department.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import { DepartmentController } from "../controllers/department.controller";

const router = Router();

router.post(
  "/create-department",
  departmentCreateValidator,
  validationResultMiddleware,
  DepartmentController.createDepartment
);

export default router;
