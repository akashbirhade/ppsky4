import { Router } from 'express';
import {
  getDashboardStats, getUsers, getUserById, updateUserStatus, deleteUser,
  getReports, reviewReport, getVerificationRequests, processVerification,
  getSubscriptions, getAnalytics, getAuditLogs,
} from '@controllers/admin.controller';
import { authenticate, requireAdmin } from '@middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Reports
router.get('/reports', getReports);
router.put('/reports/:id/review', reviewReport);

// Verification
router.get('/verifications', getVerificationRequests);
router.put('/verifications/:userId', processVerification);

// Subscriptions
router.get('/subscriptions', getSubscriptions);

export default router;
