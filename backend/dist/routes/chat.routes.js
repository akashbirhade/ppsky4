"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("@controllers/chat.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const validate_middleware_1 = require("@middleware/validate.middleware");
const validators_1 = require("@utils/validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', chat_controller_1.getConversations);
router.post('/:userId/conversation', chat_controller_1.getOrCreateConversation);
router.get('/:conversationId/messages', chat_controller_1.getMessages);
router.post('/:conversationId/messages', (0, validate_middleware_1.validate)(validators_1.sendMessageSchema), chat_controller_1.sendMessage);
router.delete('/:conversationId/messages/:messageId', chat_controller_1.deleteMessage);
router.put('/:conversationId/read', chat_controller_1.markConversationRead);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map