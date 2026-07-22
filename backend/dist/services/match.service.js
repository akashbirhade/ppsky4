"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchService = void 0;
exports.haversineDistance = haversineDistance;
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("@middleware/error.middleware");
// Haversine formula for distance in km
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// Build a Prisma `where` clause from filter query params
function buildProfileFilter(filters, excludeUserId, gender) {
    const opposite = gender === 'MALE' ? 'FEMALE' : 'MALE';
    const where = {
        user: {
            gender: opposite,
            accountStatus: 'ACTIVE',
            id: { not: excludeUserId },
            deletedAt: null,
            blockedBy: { none: { blockerId: excludeUserId } },
            blockedUsers: { none: { blockedId: excludeUserId } },
        },
    };
    if (filters.minAge || filters.maxAge) {
        where.age = {};
        if (filters.minAge)
            where.age.gte = Number(filters.minAge);
        if (filters.maxAge)
            where.age.lte = Number(filters.maxAge);
    }
    if (filters.minHeight || filters.maxHeight) {
        where.height = {};
        if (filters.minHeight)
            where.height.gte = Number(filters.minHeight);
        if (filters.maxHeight)
            where.height.lte = Number(filters.maxHeight);
    }
    if (filters.religion)
        where.religion = { in: filters.religion.split(',') };
    if (filters.caste)
        where.caste = { in: filters.caste.split(',') };
    if (filters.motherTongue)
        where.motherTongue = { in: filters.motherTongue.split(',') };
    if (filters.education)
        where.education = { contains: filters.education, mode: 'insensitive' };
    if (filters.profession)
        where.profession = { contains: filters.profession, mode: 'insensitive' };
    if (filters.maritalStatus)
        where.maritalStatus = { in: filters.maritalStatus.split(',') };
    if (filters.city)
        where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.district)
        where.district = { contains: filters.district, mode: 'insensitive' };
    if (filters.state)
        where.state = { contains: filters.state, mode: 'insensitive' };
    if (filters.minIncome || filters.maxIncome) {
        where.annualIncome = {};
        if (filters.minIncome)
            where.annualIncome.gte = Number(filters.minIncome);
        if (filters.maxIncome)
            where.annualIncome.lte = Number(filters.maxIncome);
    }
    return where;
}
const PROFILE_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    age: true,
    height: true,
    city: true,
    district: true,
    state: true,
    religion: true,
    caste: true,
    education: true,
    profession: true,
    annualIncome: true,
    motherTongue: true,
    maritalStatus: true,
    bio: true,
    isVerified: true,
    verificationBadge: true,
    profileViews: true,
    likesReceived: true,
    latitude: true,
    longitude: true,
    profileCompletionPercentage: true,
    user: {
        select: {
            id: true,
            gender: true,
            lastActive: true,
            accountStatus: true,
            subscription: { select: { plan: true, isActive: true } },
            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
        },
    },
};
class MatchService {
    // ─── NEW PROFILES ────────────────────────────────────────────────────────────
    async getNewProfiles(userId, gender, filters, page, limit) {
        const where = buildProfileFilter(filters, userId, gender);
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── RECENTLY ACTIVE ─────────────────────────────────────────────────────────
    async getRecentlyActive(userId, gender, filters, page, limit) {
        const where = buildProfileFilter(filters, userId, gender);
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { user: { lastActive: 'desc' } },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── NEAR ME ────────────────────────────────────────────────────────────────
    async getNearMe(userId, gender, filters, page, limit) {
        const myProfile = await prisma_1.default.profile.findUnique({
            where: { userId },
            select: { latitude: true, longitude: true },
        });
        if (!myProfile)
            throw new error_middleware_1.AppError('Profile not found', 404);
        const myLat = Number(myProfile.latitude);
        const myLng = Number(myProfile.longitude);
        const radius = Number(filters.radius) || 100; // km
        // Use Postgres raw query for spatial filtering
        const rawProfiles = await prisma_1.default.$queryRaw `
      SELECT p.id, p."userId",
        ( 6371 * acos(
            cos(radians(${myLat})) * cos(radians(CAST(p.latitude AS FLOAT)))
            * cos(radians(CAST(p.longitude AS FLOAT)) - radians(${myLng}))
            + sin(radians(${myLat})) * sin(radians(CAST(p.latitude AS FLOAT)))
          )
        ) AS distance_km
      FROM profiles p
      JOIN users u ON u.id = p."userId"
      WHERE u.gender = ${gender === 'MALE' ? 'FEMALE' : 'MALE'}
        AND u."accountStatus" = 'ACTIVE'
        AND u.id != ${userId}
        AND u."deletedAt" IS NULL
        AND ( 6371 * acos(
              cos(radians(${myLat})) * cos(radians(CAST(p.latitude AS FLOAT)))
              * cos(radians(CAST(p.longitude AS FLOAT)) - radians(${myLng}))
              + sin(radians(${myLat})) * sin(radians(CAST(p.latitude AS FLOAT)))
            )
          ) <= ${radius}
      ORDER BY distance_km ASC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
        if (rawProfiles.length === 0)
            return { profiles: [], total: 0, page, pages: 0 };
        const ids = rawProfiles.map((r) => r.id);
        const profiles = await prisma_1.default.profile.findMany({
            where: { id: { in: ids } },
            select: PROFILE_SELECT,
        });
        // Attach distance
        const withDistance = profiles.map((p) => ({
            ...p,
            distance: rawProfiles.find((r) => r.id === p.id)?.distance_km?.toFixed(1),
        }));
        return { profiles: withDistance, total: rawProfiles.length, page, pages: Math.ceil(rawProfiles.length / limit) };
    }
    // ─── MOST VIEWED ─────────────────────────────────────────────────────────────
    async getMostViewed(userId, gender, filters, page, limit) {
        const where = buildProfileFilter(filters, userId, gender);
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { profileViews: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── MOST LIKED ──────────────────────────────────────────────────────────────
    async getMostLiked(userId, gender, filters, page, limit) {
        const where = buildProfileFilter(filters, userId, gender);
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { likesReceived: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── PREMIUM MEMBERS ─────────────────────────────────────────────────────────
    async getPremiumProfiles(userId, gender, filters, page, limit) {
        const where = {
            ...buildProfileFilter(filters, userId, gender),
            user: {
                ...buildProfileFilter(filters, userId, gender).user,
                subscription: { isActive: true, plan: { not: 'FREE' } },
            },
        };
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── VERIFIED PROFILES ───────────────────────────────────────────────────────
    async getVerifiedProfiles(userId, gender, filters, page, limit) {
        const where = { ...buildProfileFilter(filters, userId, gender), isVerified: true };
        const [profiles, total] = await Promise.all([
            prisma_1.default.profile.findMany({
                where,
                select: PROFILE_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profile.count({ where }),
        ]);
        return { profiles, total, page, pages: Math.ceil(total / limit) };
    }
    // ─── LIKE / UNLIKE ───────────────────────────────────────────────────────────
    async likeProfile(fromUserId, toUserId) {
        if (fromUserId === toUserId)
            throw new error_middleware_1.AppError('Cannot like yourself', 400);
        // Check if target already liked this user → mutual like = MATCH!
        const [existingLike, reverseLike] = await Promise.all([
            prisma_1.default.like.findUnique({ where: { fromUserId_toUserId: { fromUserId, toUserId } } }),
            prisma_1.default.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } } }),
        ]);
        if (existingLike)
            throw new error_middleware_1.AppError('Already liked this profile', 409);
        const isMatch = !!reverseLike;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.like.create({ data: { fromUserId, toUserId, isMatch } });
            if (isMatch) {
                await tx.like.update({
                    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
                    data: { isMatch: true, matchedAt: new Date() },
                });
            }
            await tx.profile.update({
                where: { userId: toUserId },
                data: { likesReceived: { increment: 1 } },
            });
            // Notification
            await tx.notification.create({
                data: {
                    userId: toUserId,
                    type: isMatch ? 'MATCH' : 'LIKE',
                    title: isMatch ? "It's a Match! 💜" : 'Someone liked your profile!',
                    body: isMatch
                        ? 'You and another user have liked each other!'
                        : 'Your profile received a new like.',
                    data: { fromUserId },
                },
            });
        });
        return { isMatch };
    }
    async unlikeProfile(fromUserId, toUserId) {
        const like = await prisma_1.default.like.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
        });
        if (!like)
            throw new error_middleware_1.AppError('Like not found', 404);
        await prisma_1.default.$transaction([
            prisma_1.default.like.delete({ where: { fromUserId_toUserId: { fromUserId, toUserId } } }),
            prisma_1.default.profile.update({ where: { userId: toUserId }, data: { likesReceived: { decrement: 1 } } }),
        ]);
    }
    async superLikeProfile(fromUserId, toUserId, message) {
        if (fromUserId === toUserId)
            throw new error_middleware_1.AppError('Cannot super like yourself', 400);
        const existing = await prisma_1.default.superLike.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
        });
        if (existing)
            throw new error_middleware_1.AppError('Already super liked this profile', 409);
        await prisma_1.default.$transaction([
            prisma_1.default.superLike.create({ data: { fromUserId, toUserId, message } }),
            prisma_1.default.profile.update({ where: { userId: toUserId }, data: { superLikesReceived: { increment: 1 } } }),
            prisma_1.default.notification.create({
                data: {
                    userId: toUserId,
                    type: 'SUPER_LIKE',
                    title: '⭐ You got a Super Like!',
                    body: message || 'Someone super liked your profile!',
                    data: { fromUserId },
                },
            }),
        ]);
    }
    async viewProfile(viewerId, viewedId) {
        if (viewerId === viewedId)
            return;
        await Promise.all([
            prisma_1.default.profileView.create({ data: { viewerId, viewedId } }),
            prisma_1.default.profile.update({ where: { userId: viewedId }, data: { profileViews: { increment: 1 } } }),
        ]);
    }
    async favoriteProfile(userId, favoriteUserId) {
        if (userId === favoriteUserId)
            throw new error_middleware_1.AppError('Cannot favorite yourself', 400);
        await prisma_1.default.favorite.upsert({
            where: { userId_favoriteUserId: { userId, favoriteUserId } },
            create: { userId, favoriteUserId },
            update: {},
        });
    }
    async unfavoriteProfile(userId, favoriteUserId) {
        await prisma_1.default.favorite.deleteMany({ where: { userId, favoriteUserId } });
    }
    async blockUser(blockerId, blockedId, reason) {
        if (blockerId === blockedId)
            throw new error_middleware_1.AppError('Cannot block yourself', 400);
        await prisma_1.default.block.upsert({
            where: { blockerId_blockedId: { blockerId, blockedId } },
            create: { blockerId, blockedId, reason },
            update: { reason },
        });
    }
    async getLikesReceived(userId, page, limit) {
        const [likes, total] = await Promise.all([
            prisma_1.default.like.findMany({
                where: { toUserId: userId },
                include: {
                    fromUser: {
                        select: {
                            id: true,
                            gender: true,
                            lastActive: true,
                            profile: { select: { firstName: true, lastName: true, age: true, city: true, profession: true, isVerified: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.like.count({ where: { toUserId: userId } }),
        ]);
        return { likes, total, page, pages: Math.ceil(total / limit) };
    }
    async getLikesSent(userId, page, limit) {
        const [likes, total] = await Promise.all([
            prisma_1.default.like.findMany({
                where: { fromUserId: userId },
                include: {
                    toUser: {
                        select: {
                            id: true,
                            gender: true,
                            lastActive: true,
                            profile: { select: { firstName: true, lastName: true, age: true, city: true, profession: true, isVerified: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.like.count({ where: { fromUserId: userId } }),
        ]);
        return { likes, total, page, pages: Math.ceil(total / limit) };
    }
    async getViewedByMe(userId, page, limit) {
        const [views, total] = await Promise.all([
            prisma_1.default.profileView.findMany({
                where: { viewerId: userId },
                include: {
                    viewed: {
                        select: {
                            id: true,
                            gender: true,
                            lastActive: true,
                            profile: { select: { firstName: true, lastName: true, age: true, city: true, profession: true, isVerified: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profileView.count({ where: { viewerId: userId } }),
        ]);
        return { views, total, page, pages: Math.ceil(total / limit) };
    }
    async getFavorites(userId, page, limit) {
        const [favorites, total] = await Promise.all([
            prisma_1.default.favorite.findMany({
                where: { userId },
                include: {
                    favoriteUser: {
                        select: {
                            id: true,
                            gender: true,
                            lastActive: true,
                            profile: { select: { firstName: true, lastName: true, age: true, city: true, profession: true, isVerified: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.favorite.count({ where: { userId } }),
        ]);
        return { favorites, total, page, pages: Math.ceil(total / limit) };
    }
}
exports.MatchService = MatchService;
//# sourceMappingURL=match.service.js.map