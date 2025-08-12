import { Router } from "express";
import { completeUserProfileValidator } from "../validators/user.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";
import { UserController } from "../controllers/user.controller";

const router = Router();

router.patch(
  "/complete-profile/:id",
  completeUserProfileValidator,
  validationResultMiddleware,
  UserController.completeProfile
);

export default router;