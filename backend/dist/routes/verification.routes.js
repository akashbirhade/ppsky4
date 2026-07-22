"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@middleware/auth.middleware");
const verification_controller_1 = require("@controllers/verification.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/submit', verification_controller_1.submitVerification);
router.get('/status', verification_controller_1.getVerificationStatus);
exports.default = router;
//# sourceMappingURL=verification.routes.js.map