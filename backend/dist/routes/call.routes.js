"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const call_controller_1 = require("@controllers/call.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const validate_middleware_1 = require("@middleware/validate.middleware");
const validators_1 = require("@utils/validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/', (0, validate_middleware_1.validate)(validators_1.initiateCallSchema), call_controller_1.initiateCall);
router.put('/:callId/answer', call_controller_1.answerCall);
router.put('/:callId/end', call_controller_1.endCall);
router.get('/history', call_controller_1.getCallHistory);
router.get('/missed', call_controller_1.getMissedCalls);
exports.default = router;
//# sourceMappingURL=call.routes.js.map