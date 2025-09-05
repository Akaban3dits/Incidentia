import { Router } from "express";
import DepartmentRoutes from "./departments.routes";
import DeviceTypeRoutes from "./deviceType.routes";
import UserRoutes from "./users.routes";
import DeviceRoutes from "./devices.routes";
import TicketRoutes from "./tickets.routes";

const router = Router();

router.use("/departments", DepartmentRoutes);
router.use("/device-types", DeviceTypeRoutes);
router.use("/devices", DeviceRoutes);
router.use("/users", UserRoutes);
router.use("/tickets", TicketRoutes);

export default router;
