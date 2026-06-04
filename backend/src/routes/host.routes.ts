import { Router } from 'express';
import {
  createHost, getHosts, getHostById, updateHost, deleteHost,
  assignMember, removeMember, transferMember, getHostMembers,
  createHostEvent, getHostEvents, updateHostEvent, deleteHostEvent,
  createInterest, getHostInterests, updateInterestStatus,
  getHostStats,
} from '@controllers/host.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getHosts);
router.get('/:id', getHostById);
router.get('/:id/events', getHostEvents);

// Authenticated routes
router.use(authenticate);

// Host CRUD (admin only via frontend guard)
router.post('/', createHost);
router.put('/:id', updateHost);
router.delete('/:id', deleteHost);

// Members
router.get('/:id/members', getHostMembers);
router.post('/:id/members', assignMember);
router.post('/:id/members/transfer', transferMember);
router.delete('/:id/members/:userId', removeMember);

// Events
router.post('/:id/events', createHostEvent);
router.put('/:id/events/:eventId', updateHostEvent);
router.delete('/:id/events/:eventId', deleteHostEvent);

// Interests
router.get('/:id/interests', getHostInterests);
router.post('/:id/interests', createInterest);
router.put('/:id/interests/:interestId', updateInterestStatus);

// Dashboard
router.get('/:id/stats', getHostStats);

export default router;
