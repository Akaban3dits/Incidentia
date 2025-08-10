import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller';

const router = Router();

router.post('/send-code', verificationController.sendCode);
router.post('/verify-code', verificationController.verifyCode);

export default router;
 