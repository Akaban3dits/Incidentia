import { Router } from "express";
import DepartmentRoutes from "./departments.routes";

const router = Router();

router.use("/departments", DepartmentRoutes);


export default router;
