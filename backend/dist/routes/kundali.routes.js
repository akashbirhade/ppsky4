"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kundali_controller_1 = require("@controllers/kundali.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/calculate', kundali_controller_1.calculateKundali);
router.get('/options', kundali_controller_1.getRashiList);
exports.default = router;
//# sourceMappingURL=kundali.routes.js.map