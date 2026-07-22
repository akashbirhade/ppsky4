"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("@controllers/admin.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
// Dashboard
router.get('/dashboard', admin_controller_1.getDashboardStats);
router.get('/analytics', admin_controller_1.getAnalytics);
router.get('/audit-logs', admin_controller_1.getAuditLogs);
// Users
router.get('/users', admin_controller_1.getUsers);
router.get('/users/:id', admin_controller_1.getUserById);
router.put('/users/:id/status', admin_controller_1.updateUserStatus);
router.delete('/users/:id', admin_controller_1.deleteUser);
// Reports
router.get('/reports', admin_controller_1.getReports);
router.put('/reports/:id/review', admin_controller_1.reviewReport);
// Verification
router.get('/verifications', admin_controller_1.getVerificationRequests);
router.put('/verifications/:userId', admin_controller_1.processVerification);
// Subscriptions
router.get('/subscriptions', admin_controller_1.getSubscriptions);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map