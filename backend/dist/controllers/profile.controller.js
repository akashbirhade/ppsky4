"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProfiles = exports.getMyProfileViews = exports.updatePreferences = exports.getPreferences = exports.deletePhoto = exports.setMainPhoto = exports.uploadPhoto = exports.updateProfile = exports.getProfileById = exports.getMyProfile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("@middleware/error.middleware");
const index_1 = require("@config/index");
const alert_service_1 = require("@services/alert.service");
const upload_service_1 = require("@services/upload.service");
const uploadService = new upload_service_1.UploadService();
// ─── GET MY PROFILE ──────────────────────────────────────────────────────────
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId: req.user.userId },
            include: {
                user: {
                    select: {
                        id: true, username: true, email: true, gender: true,
                        emailVerified: true, mobileVerified: true, lastActive: true, createdAt: true,
                        subscription: true,
                        photos: { orderBy: { order: 'asc' } },
                        preferences: true,
                    },
                },
            },
        });
        if (!profile)
            throw new error_middleware_1.AppError('Profile not found', 404);
        res.json({ success: true, data: profile });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyProfile = getMyProfile;
// ─── GET PROFILE BY ID ───────────────────────────────────────────────────────
const getProfileById = async (req, res, next) => {
    try {
        const { id } = req.params; // userId
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId: id },
            include: {
                user: {
                    select: {
                        id: true, username: true, gender: true, lastActive: true, accountStatus: true,
                        subscription: { select: { plan: true, isActive: true } },
                        photos: { where: { isMain: false }, orderBy: { order: 'asc' } },
                    },
                },
            },
        });
        if (!profile || profile.user.accountStatus !== 'ACTIVE') {
            throw new error_middleware_1.AppError('Profile not found', 404);
        }
        // Record profile view
        if (req.user?.userId && req.user.userId !== id) {
            await Promise.all([
                prisma_1.default.profileView.create({ data: { viewerId: req.user.userId, viewedId: id } }).catch(() => { }),
                prisma_1.default.profile.update({ where: { userId: id }, data: { profileViews: { increment: 1 } } }).catch(() => { }),
            ]);
        }
        // Check if requester has liked / favorited this profile
        let isLiked = false;
        let isFavorited = false;
        let isBlocked = false;
        if (req.user?.userId) {
            const [like, fav, block] = await Promise.all([
                prisma_1.default.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: req.user.userId, toUserId: id } } }),
                prisma_1.default.favorite.findUnique({ where: { userId_favoriteUserId: { userId: req.user.userId, favoriteUserId: id } } }),
                prisma_1.default.block.findUnique({ where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: id } } }),
            ]);
            isLiked = !!like;
            isFavorited = !!fav;
            isBlocked = !!block;
        }
        // Hide WhatsApp if not visible
        const responseProfile = { ...profile };
        if (!profile.whatsappVisible) {
            responseProfile.whatsappNumber = undefined;
        }
        res.json({ success: true, data: { ...responseProfile, isLiked, isFavorited, isBlocked } });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfileById = getProfileById;
// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const data = req.body;
        // Recalculate completion percentage
        const updated = await prisma_1.default.profile.update({
            where: { userId },
            data: {
                ...data,
                profileCompletionPercentage: await calculateCompletion({ ...data }),
            },
        });
        // Send email + SMS notification
        const userRecord = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { email: true, mobileNumber: true, username: true },
        });
        if (userRecord) {
            const updatedFields = Object.keys(data).filter(k => k !== 'profileCompletionPercentage');
            (0, alert_service_1.sendProfileUpdateAlert)({
                email: userRecord.email,
                phone: userRecord.mobileNumber ?? undefined,
                userName: userRecord.username,
                updatedFields,
            }).catch(() => { }); // fire-and-forget
        }
        res.json({ success: true, message: 'Profile updated', data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
// ─── UPLOAD PHOTO ────────────────────────────────────────────────────────────
const uploadPhoto = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const file = req.file;
        if (!file)
            throw new error_middleware_1.AppError('No file uploaded', 400);
        const photoCount = await prisma_1.default.photo.count({ where: { userId } });
        if (photoCount >= 10)
            throw new error_middleware_1.AppError('Maximum 10 photos allowed', 400);
        const isMain = photoCount === 0;
        // Persist the uploaded file. The route uses multer memory storage, so the
        // binary lives in `file.buffer`. Prefer Cloudinary when it is configured and
        // working, but always fall back to local disk so uploads never fail silently.
        let url = '';
        let publicId;
        let size = file.size;
        let width;
        let height;
        let stored = false;
        const cloudinaryReady = Boolean(index_1.config.cloudinary.cloudName && index_1.config.cloudinary.apiKey && index_1.config.cloudinary.apiSecret);
        if (cloudinaryReady) {
            try {
                const result = await uploadService.uploadProfilePhoto(file.buffer, userId, file.mimetype);
                url = result.url;
                publicId = result.publicId;
                size = result.size;
                width = result.width;
                height = result.height;
                stored = true;
            }
            catch {
                // Invalid/misconfigured Cloudinary credentials — fall back to local disk.
                stored = false;
            }
        }
        if (!stored) {
            const ext = (file.originalname?.split('.').pop() || 'jpg').toLowerCase();
            const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
            const fileName = `${Date.now()}-${crypto_1.default.randomBytes(6).toString('hex')}.${safeExt}`;
            const absDir = path_1.default.join(process.cwd(), 'uploads', 'profiles', userId);
            fs_1.default.mkdirSync(absDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(absDir, fileName), file.buffer);
            publicId = `profiles/${userId}/${fileName}`;
            url = `${req.protocol}://${req.get('host')}/uploads/profiles/${userId}/${fileName}`;
        }
        const photo = await prisma_1.default.photo.create({
            data: {
                userId,
                url,
                publicId,
                isMain,
                order: photoCount,
                size,
                width,
                height,
            },
        });
        res.status(201).json({ success: true, data: photo });
        // Send email + SMS notification (after response sent)
        prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { email: true, mobileNumber: true, username: true },
        }).then(userRecord => {
            if (userRecord) {
                (0, alert_service_1.sendPhotoUploadAlert)({
                    email: userRecord.email,
                    phone: userRecord.mobileNumber ?? undefined,
                    userName: userRecord.username,
                }).catch(() => { });
            }
        }).catch(() => { });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadPhoto = uploadPhoto;
// ─── SET MAIN PHOTO ──────────────────────────────────────────────────────────
const setMainPhoto = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { photoId } = req.params;
        const photo = await prisma_1.default.photo.findFirst({ where: { id: photoId, userId } });
        if (!photo)
            throw new error_middleware_1.AppError('Photo not found', 404);
        await prisma_1.default.$transaction([
            prisma_1.default.photo.updateMany({ where: { userId }, data: { isMain: false } }),
            prisma_1.default.photo.update({ where: { id: photoId }, data: { isMain: true } }),
        ]);
        res.json({ success: true, message: 'Main photo updated' });
    }
    catch (err) {
        next(err);
    }
};
exports.setMainPhoto = setMainPhoto;
// ─── DELETE PHOTO ────────────────────────────────────────────────────────────
const deletePhoto = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { photoId } = req.params;
        const photo = await prisma_1.default.photo.findFirst({ where: { id: photoId, userId } });
        if (!photo)
            throw new error_middleware_1.AppError('Photo not found', 404);
        await prisma_1.default.photo.delete({ where: { id: photoId } });
        // If deleted was main, set first remaining as main
        if (photo.isMain) {
            const next_photo = await prisma_1.default.photo.findFirst({ where: { userId }, orderBy: { order: 'asc' } });
            if (next_photo) {
                await prisma_1.default.photo.update({ where: { id: next_photo.id }, data: { isMain: true } });
            }
        }
        res.json({ success: true, message: 'Photo deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deletePhoto = deletePhoto;
// ─── GET PREFERENCES ─────────────────────────────────────────────────────────
const getPreferences = async (req, res, next) => {
    try {
        const prefs = await prisma_1.default.preference.findUnique({ where: { userId: req.user.userId } });
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        next(err);
    }
};
exports.getPreferences = getPreferences;
// ─── UPDATE PREFERENCES ──────────────────────────────────────────────────────
const updatePreferences = async (req, res, next) => {
    try {
        const prefs = await prisma_1.default.preference.upsert({
            where: { userId: req.user.userId },
            update: req.body,
            create: { userId: req.user.userId, ...req.body },
        });
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePreferences = updatePreferences;
// ─── PROFILE VIEWS ───────────────────────────────────────────────────────────
const getMyProfileViews = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const [views, total] = await Promise.all([
            prisma_1.default.profileView.findMany({
                where: { viewedId: req.user.userId },
                include: {
                    viewer: {
                        select: {
                            id: true, gender: true, lastActive: true,
                            profile: { select: { firstName: true, lastName: true, age: true, city: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.profileView.count({ where: { viewedId: req.user.userId } }),
        ]);
        res.json({ success: true, data: { views, total, page, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyProfileViews = getMyProfileViews;
// ─── SEARCH PROFILES ─────────────────────────────────────────────────────────
const searchProfiles = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId }, select: { gender: true } });
        const opposite = user?.gender === 'MALE' ? 'FEMALE' : 'MALE';
        const results = await prisma_1.default.profile.findMany({
            where: {
                OR: [
                    { firstName: { contains: String(q), mode: 'insensitive' } },
                    { lastName: { contains: String(q), mode: 'insensitive' } },
                    { city: { contains: String(q), mode: 'insensitive' } },
                    { profession: { contains: String(q), mode: 'insensitive' } },
                ],
                user: {
                    gender: opposite,
                    accountStatus: 'ACTIVE',
                    id: { not: userId },
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                age: true,
                city: true,
                profession: true,
                isVerified: true,
                user: {
                    select: {
                        id: true, gender: true,
                        photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                    },
                },
            },
            take: Math.min(Number(limit), index_1.config.pagination.maxPageSize),
            skip: (Number(page) - 1) * Number(limit),
        });
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
};
exports.searchProfiles = searchProfiles;
// ─── HELPER ──────────────────────────────────────────────────────────────────
async function calculateCompletion(data) {
    const fields = [
        'firstName', 'lastName', 'dateOfBirth', 'height', 'religion',
        'caste', 'motherTongue', 'education', 'profession', 'annualIncome',
        'city', 'bio', 'hobbies',
    ];
    const filled = fields.filter((f) => data[f] !== undefined && data[f] !== null && data[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
}
//# sourceMappingURL=profile.controller.js.map