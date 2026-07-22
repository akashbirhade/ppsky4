"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostStats = exports.updateInterestStatus = exports.getHostInterests = exports.createInterest = exports.deleteHostEvent = exports.updateHostEvent = exports.getHostEvents = exports.createHostEvent = exports.getHostMembers = exports.transferMember = exports.removeMember = exports.assignMember = exports.deleteHost = exports.updateHost = exports.getHostById = exports.getHosts = exports.createHost = void 0;
const hostService = __importStar(require("@services/host.service"));
// ─── HOST CRUD ──────────────────────────────────────────────────────────────
const createHost = async (req, res, next) => {
    try {
        const host = await hostService.createHost(req.body);
        res.status(201).json({ success: true, data: host });
    }
    catch (err) {
        next(err);
    }
};
exports.createHost = createHost;
const getHosts = async (req, res, next) => {
    try {
        const { region, district, city, status, page, limit } = req.query;
        const data = await hostService.getHosts({
            region: region,
            district: district,
            city: city,
            status: status,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getHosts = getHosts;
const getHostById = async (req, res, next) => {
    try {
        const host = await hostService.getHostById(req.params.id);
        if (!host)
            return res.status(404).json({ success: false, message: 'Host not found' });
        res.json({ success: true, data: host });
    }
    catch (err) {
        next(err);
    }
};
exports.getHostById = getHostById;
const updateHost = async (req, res, next) => {
    try {
        const host = await hostService.updateHost(req.params.id, req.body);
        res.json({ success: true, data: host });
    }
    catch (err) {
        next(err);
    }
};
exports.updateHost = updateHost;
const deleteHost = async (req, res, next) => {
    try {
        await hostService.deleteHost(req.params.id);
        res.json({ success: true, message: 'Host deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteHost = deleteHost;
// ─── MEMBER MANAGEMENT ──────────────────────────────────────────────────────
const assignMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const member = await hostService.assignMember(req.params.id, userId);
        res.status(201).json({ success: true, data: member });
    }
    catch (err) {
        next(err);
    }
};
exports.assignMember = assignMember;
const removeMember = async (req, res, next) => {
    try {
        await hostService.removeMember(req.params.id, req.params.userId);
        res.json({ success: true, message: 'Member removed' });
    }
    catch (err) {
        next(err);
    }
};
exports.removeMember = removeMember;
const transferMember = async (req, res, next) => {
    try {
        const { toHostId, userId } = req.body;
        await hostService.transferMember(req.params.id, toHostId, userId);
        res.json({ success: true, message: 'Member transferred' });
    }
    catch (err) {
        next(err);
    }
};
exports.transferMember = transferMember;
const getHostMembers = async (req, res, next) => {
    try {
        const { gender, page, limit } = req.query;
        const data = await hostService.getHostMembers(req.params.id, {
            gender: gender,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getHostMembers = getHostMembers;
// ─── HOST EVENTS ────────────────────────────────────────────────────────────
const createHostEvent = async (req, res, next) => {
    try {
        const event = await hostService.createHostEvent({ ...req.body, hostId: req.params.id });
        res.status(201).json({ success: true, data: event });
    }
    catch (err) {
        next(err);
    }
};
exports.createHostEvent = createHostEvent;
const getHostEvents = async (req, res, next) => {
    try {
        const events = await hostService.getHostEvents(req.params.id);
        res.json({ success: true, data: events });
    }
    catch (err) {
        next(err);
    }
};
exports.getHostEvents = getHostEvents;
const updateHostEvent = async (req, res, next) => {
    try {
        const event = await hostService.updateHostEvent(req.params.eventId, req.body);
        res.json({ success: true, data: event });
    }
    catch (err) {
        next(err);
    }
};
exports.updateHostEvent = updateHostEvent;
const deleteHostEvent = async (req, res, next) => {
    try {
        await hostService.deleteHostEvent(req.params.eventId);
        res.json({ success: true, message: 'Event deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteHostEvent = deleteHostEvent;
// ─── HOST INTERESTS ─────────────────────────────────────────────────────────
const createInterest = async (req, res, next) => {
    try {
        const interest = await hostService.createInterest({ ...req.body, hostId: req.params.id });
        res.status(201).json({ success: true, data: interest });
    }
    catch (err) {
        next(err);
    }
};
exports.createInterest = createInterest;
const getHostInterests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const interests = await hostService.getHostInterests(req.params.id, status);
        res.json({ success: true, data: interests });
    }
    catch (err) {
        next(err);
    }
};
exports.getHostInterests = getHostInterests;
const updateInterestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const interest = await hostService.updateInterestStatus(req.params.interestId, status);
        res.json({ success: true, data: interest });
    }
    catch (err) {
        next(err);
    }
};
exports.updateInterestStatus = updateInterestStatus;
// ─── HOST DASHBOARD ─────────────────────────────────────────────────────────
const getHostStats = async (req, res, next) => {
    try {
        const stats = await hostService.getHostStats(req.params.id);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getHostStats = getHostStats;
//# sourceMappingURL=host.controller.js.map