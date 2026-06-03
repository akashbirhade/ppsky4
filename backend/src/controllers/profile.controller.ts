import { Request, Response, NextFunction } from 'express';
import prisma from '@config/prisma';
import { AppError } from '@middleware/error.middleware';
import { config } from '@config/index';

// ─── GET MY PROFILE ──────────────────────────────────────────────────────────

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
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

    if (!profile) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
};

// ─── GET PROFILE BY ID ───────────────────────────────────────────────────────

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // userId

    const profile = await prisma.profile.findUnique({
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
      throw new AppError('Profile not found', 404);
    }

    // Record profile view
    if (req.user?.userId && req.user.userId !== id) {
      await Promise.all([
        prisma.profileView.create({ data: { viewerId: req.user.userId, viewedId: id } }).catch(() => {}),
        prisma.profile.update({ where: { userId: id }, data: { profileViews: { increment: 1 } } }).catch(() => {}),
      ]);
    }

    // Check if requester has liked / favorited this profile
    let isLiked = false;
    let isFavorited = false;
    let isBlocked = false;

    if (req.user?.userId) {
      const [like, fav, block] = await Promise.all([
        prisma.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: req.user.userId, toUserId: id } } }),
        prisma.favorite.findUnique({ where: { userId_favoriteUserId: { userId: req.user.userId, favoriteUserId: id } } }),
        prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: id } } }),
      ]);
      isLiked = !!like;
      isFavorited = !!fav;
      isBlocked = !!block;
    }

    // Hide WhatsApp if not visible
    const responseProfile = { ...profile };
    if (!profile.whatsappVisible) {
      (responseProfile as any).whatsappNumber = undefined;
    }

    res.json({ success: true, data: { ...responseProfile, isLiked, isFavorited, isBlocked } });
  } catch (err) { next(err); }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = req.body;

    // Recalculate completion percentage
    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        ...data,
        profileCompletionPercentage: await calculateCompletion({ ...data }),
      },
    });

    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) { next(err); }
};

// ─── UPLOAD PHOTO ────────────────────────────────────────────────────────────

export const uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const file = req.file as any;

    if (!file) throw new AppError('No file uploaded', 400);

    const photoCount = await prisma.photo.count({ where: { userId } });
    if (photoCount >= 10) throw new AppError('Maximum 10 photos allowed', 400);

    const isMain = photoCount === 0;

    const photo = await prisma.photo.create({
      data: {
        userId,
        url: file.path || file.url,
        publicId: file.filename || file.public_id,
        isMain,
        order: photoCount,
        size: file.size,
      },
    });

    res.status(201).json({ success: true, data: photo });
  } catch (err) { next(err); }
};

// ─── SET MAIN PHOTO ──────────────────────────────────────────────────────────

export const setMainPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { photoId } = req.params;

    const photo = await prisma.photo.findFirst({ where: { id: photoId, userId } });
    if (!photo) throw new AppError('Photo not found', 404);

    await prisma.$transaction([
      prisma.photo.updateMany({ where: { userId }, data: { isMain: false } }),
      prisma.photo.update({ where: { id: photoId }, data: { isMain: true } }),
    ]);

    res.json({ success: true, message: 'Main photo updated' });
  } catch (err) { next(err); }
};

// ─── DELETE PHOTO ────────────────────────────────────────────────────────────

export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { photoId } = req.params;

    const photo = await prisma.photo.findFirst({ where: { id: photoId, userId } });
    if (!photo) throw new AppError('Photo not found', 404);

    await prisma.photo.delete({ where: { id: photoId } });

    // If deleted was main, set first remaining as main
    if (photo.isMain) {
      const next_photo = await prisma.photo.findFirst({ where: { userId }, orderBy: { order: 'asc' } });
      if (next_photo) {
        await prisma.photo.update({ where: { id: next_photo.id }, data: { isMain: true } });
      }
    }

    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) { next(err); }
};

// ─── GET PREFERENCES ─────────────────────────────────────────────────────────

export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await prisma.preference.findUnique({ where: { userId: req.user!.userId } });
    res.json({ success: true, data: prefs });
  } catch (err) { next(err); }
};

// ─── UPDATE PREFERENCES ──────────────────────────────────────────────────────

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await prisma.preference.upsert({
      where: { userId: req.user!.userId },
      update: req.body,
      create: { userId: req.user!.userId, ...req.body },
    });
    res.json({ success: true, data: prefs });
  } catch (err) { next(err); }
};

// ─── PROFILE VIEWS ───────────────────────────────────────────────────────────

export const getMyProfileViews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [views, total] = await Promise.all([
      prisma.profileView.findMany({
        where: { viewedId: req.user!.userId },
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
      prisma.profileView.count({ where: { viewedId: req.user!.userId } }),
    ]);

    res.json({ success: true, data: { views, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ─── SEARCH PROFILES ─────────────────────────────────────────────────────────

export const searchProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } });
    const opposite = user?.gender === 'MALE' ? 'FEMALE' : 'MALE';

    const results = await prisma.profile.findMany({
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
      take: Math.min(Number(limit), config.pagination.maxPageSize),
      skip: (Number(page) - 1) * Number(limit),
    });

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

// ─── HELPER ──────────────────────────────────────────────────────────────────

async function calculateCompletion(data: Record<string, any>): Promise<number> {
  const fields = [
    'firstName', 'lastName', 'dateOfBirth', 'height', 'religion',
    'caste', 'motherTongue', 'education', 'profession', 'annualIncome',
    'city', 'bio', 'hobbies',
  ];
  const filled = fields.filter((f) => data[f] !== undefined && data[f] !== null && data[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
