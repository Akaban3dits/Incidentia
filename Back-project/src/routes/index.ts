import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./users.routes";
import departmentRoutes from "./departments.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);


export default router;
