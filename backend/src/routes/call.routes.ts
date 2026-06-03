import { Router } from 'express';
import {
  initiateCall, answerCall, endCall, getCallHistory, getMissedCalls,
} from '@controllers/call.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { initiateCallSchema } from '@utils/validators';

const router = Router();
router.use(authenticate);

router.post('/', validate(initiateCallSchema), initiateCall);
router.put('/:callId/answer', answerCall);
router.put('/:callId/end', endCall);
router.get('/history', getCallHistory);
router.get('/missed', getMissedCalls);

export default router;
