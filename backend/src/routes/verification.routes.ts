import { Router } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { submitVerification, getVerificationStatus } from '@controllers/verification.controller';

const router = Router();

router.use(authenticate);

router.post('/submit', submitVerification);
router.get('/status', getVerificationStatus);

export default router;
