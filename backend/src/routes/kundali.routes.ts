import { Router } from 'express';
import { calculateKundali, getRashiList } from '@controllers/kundali.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/calculate', calculateKundali);
router.get('/options', getRashiList);

export default router;
