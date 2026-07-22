"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostStats = exports.updateInterestStatus = exports.getHostInterests = exports.createInterest = exports.deleteHostEvent = exports.updateHostEvent = exports.getHostEvents = exports.createHostEvent = exports.getHostMembers = exports.transferMember = exports.removeMember = exports.assignMember = exports.deleteHost = exports.updateHost = exports.getHostById = exports.getHosts = exports.createHost = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const db = prisma_1.default;
// ─── HOST CRUD ──────────────────────────────────────────────────────────────
const createHost = async (data) => {
    return db.host.create({ data });
};
exports.createHost = createHost;
const getHosts = async (filters) => {
    const { region, district, city, status, page = 1, limit = 20 } = filters;
    const where = {};
    if (region)
        where.region = region;
    if (district)
        where.district = district;
    if (city)
        where.city = city;
    if (status)
        where.status = status;
    else
        where.status = 'ACTIVE';
    const [hosts, total] = await Promise.all([
        db.host.findMany({
            where,
            include: { _count: { select: { members: true, events: true } } },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        db.host.count({ where }),
    ]);
    return { hosts, total, page, totalPages: Math.ceil(total / limit) };
};
exports.getHosts = getHosts;
const getHostById = async (id) => {
    return db.host.findUnique({
        where: { id },
        include: {
            _count: { select: { members: true, events: true } },
            events: { where: { isActive: true }, orderBy: { date: 'asc' }, take: 10 },
        },
    });
};
exports.getHostById = getHostById;
const updateHost = async (id, data) => {
    return db.host.update({ where: { id }, data });
};
exports.updateHost = updateHost;
const deleteHost = async (id) => {
    return db.host.delete({ where: { id } });
};
exports.deleteHost = deleteHost;
// ─── MEMBER MANAGEMENT ──────────────────────────────────────────────────────
const assignMember = async (hostId, userId) => {
    return db.hostMember.create({ data: { hostId, userId } });
};
exports.assignMember = assignMember;
const removeMember = async (hostId, userId) => {
    return db.hostMember.delete({
        where: { hostId_userId: { hostId, userId } },
    });
};
exports.removeMember = removeMember;
const transferMember = async (fromHostId, toHostId, userId) => {
    return prisma_1.default.$transaction([
        db.hostMember.delete({ where: { hostId_userId: { hostId: fromHostId, userId } } }),
        db.hostMember.create({ data: { hostId: toHostId, userId } }),
    ]);
};
exports.transferMember = transferMember;
const getHostMembers = async (hostId, filters) => {
    const { gender, page = 1, limit = 20 } = filters;
    const where = { hostId };
    if (gender)
        where.user = { gender };
    const members = await db.hostMember.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { joinedAt: 'desc' },
    });
    const total = await db.hostMember.count({ where });
    return { members, total, page, totalPages: Math.ceil(total / limit) };
};
exports.getHostMembers = getHostMembers;
// ─── HOST EVENTS ────────────────────────────────────────────────────────────
const createHostEvent = async (data) => {
    return db.hostEvent.create({ data: { ...data, fee: data.fee ?? undefined } });
};
exports.createHostEvent = createHostEvent;
const getHostEvents = async (hostId) => {
    return db.hostEvent.findMany({
        where: { hostId, isActive: true },
        orderBy: { date: 'asc' },
    });
};
exports.getHostEvents = getHostEvents;
const updateHostEvent = async (eventId, data) => {
    return db.hostEvent.update({ where: { id: eventId }, data });
};
exports.updateHostEvent = updateHostEvent;
const deleteHostEvent = async (eventId) => {
    return db.hostEvent.delete({ where: { id: eventId } });
};
exports.deleteHostEvent = deleteHostEvent;
// ─── HOST INTERESTS ─────────────────────────────────────────────────────────
const createInterest = async (data) => {
    return db.hostInterest.create({ data });
};
exports.createInterest = createInterest;
const getHostInterests = async (hostId, status) => {
    const where = { hostId };
    if (status)
        where.status = status;
    return db.hostInterest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
};
exports.getHostInterests = getHostInterests;
const updateInterestStatus = async (interestId, status) => {
    return db.hostInterest.update({
        where: { id: interestId },
        data: { status },
    });
};
exports.updateInterestStatus = updateInterestStatus;
// ─── HOST DASHBOARD STATS ───────────────────────────────────────────────────
const getHostStats = async (hostId) => {
    const [totalMembers, pendingInterests, upcomingEvents] = await Promise.all([
        db.hostMember.count({ where: { hostId } }),
        db.hostInterest.count({ where: { hostId, status: 'pending' } }),
        db.hostEvent.count({ where: { hostId, isActive: true, date: { gte: new Date() } } }),
    ]);
    return { totalMembers, pendingInterests, upcomingEvents };
};
exports.getHostStats = getHostStats;
//# sourceMappingURL=host.service.js.map