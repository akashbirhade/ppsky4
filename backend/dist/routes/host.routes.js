"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const host_controller_1 = require("@controllers/host.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', host_controller_1.getHosts);
router.get('/:id', host_controller_1.getHostById);
router.get('/:id/events', host_controller_1.getHostEvents);
// Authenticated routes
router.use(auth_middleware_1.authenticate);
// Host CRUD (admin only via frontend guard)
router.post('/', host_controller_1.createHost);
router.put('/:id', host_controller_1.updateHost);
router.delete('/:id', host_controller_1.deleteHost);
// Members
router.get('/:id/members', host_controller_1.getHostMembers);
router.post('/:id/members', host_controller_1.assignMember);
router.post('/:id/members/transfer', host_controller_1.transferMember);
router.delete('/:id/members/:userId', host_controller_1.removeMember);
// Events
router.post('/:id/events', host_controller_1.createHostEvent);
router.put('/:id/events/:eventId', host_controller_1.updateHostEvent);
router.delete('/:id/events/:eventId', host_controller_1.deleteHostEvent);
// Interests
router.get('/:id/interests', host_controller_1.getHostInterests);
router.post('/:id/interests', host_controller_1.createInterest);
router.put('/:id/interests/:interestId', host_controller_1.updateInterestStatus);
// Dashboard
router.get('/:id/stats', host_controller_1.getHostStats);
exports.default = router;
//# sourceMappingURL=host.routes.js.map