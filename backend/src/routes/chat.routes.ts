import { Router } from 'express';
import {
  getConversations, getOrCreateConversation, getMessages,
  sendMessage, deleteMessage, markConversationRead,
} from '@controllers/chat.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { sendMessageSchema } from '@utils/validators';

const router = Router();
router.use(authenticate);

router.get('/', getConversations);
router.post('/:userId/conversation', getOrCreateConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', validate(sendMessageSchema), sendMessage);
router.delete('/:conversationId/messages/:messageId', deleteMessage);
router.put('/:conversationId/read', markConversationRead);

export default router;
