import { Router } from "express";
import authRoutes from "./auth.routes";
import verifyRoutes from "./verification.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/verification", verifyRoutes);

export default router;
