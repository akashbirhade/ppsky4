import { Request, Response, NextFunction } from 'express';
import prisma from '@config/prisma';
import { AppError } from '@middleware/error.middleware';

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      totalUsers, activeUsers, newUsersToday, newUsersThisWeek,
      totalMale, totalFemale,
      totalMatches, matchesToday,
      totalMessages, messagesToday,
      totalCalls, callsToday,
      premiumUsers, verifiedProfiles,
      pendingReports, pendingVerifications,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { lastActive: { gte: lastWeek }, deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek }, deletedAt: null } }),
      prisma.user.count({ where: { gender: 'MALE', deletedAt: null } }),
      prisma.user.count({ where: { gender: 'FEMALE', deletedAt: null } }),
      prisma.like.count({ where: { isMatch: true } }),
      prisma.like.count({ where: { isMatch: true, createdAt: { gte: today } } }),
      prisma.message.count({ where: { deletedAt: null } }),
      prisma.message.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      prisma.call.count(),
      prisma.call.count({ where: { createdAt: { gte: today } } }),
      prisma.subscription.count({ where: { isActive: true, plan: { not: 'FREE' } } }),
      prisma.profile.count({ where: { isVerified: true } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.profile.count({ where: { govtIdVerificationStatus: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, male: totalMale, female: totalFemale, newToday: newUsersToday, newThisWeek: newUsersThisWeek, premium: premiumUsers, verified: verifiedProfiles },
        matches: { total: totalMatches, today: matchesToday },
        messages: { total: totalMessages, today: messagesToday },
        calls: { total: totalCalls, today: callsToday },
        moderation: { pendingReports, pendingVerifications },
      },
    });
  } catch (err) { next(err); }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const { search, gender, status, subscription, verified } = req.query;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: String(search), mode: 'insensitive' } },
        { username: { contains: String(search), mode: 'insensitive' } },
        { mobileNumber: { contains: String(search) } },
        { profile: { firstName: { contains: String(search), mode: 'insensitive' } } },
        { profile: { lastName: { contains: String(search), mode: 'insensitive' } } },
      ];
    }
    if (gender) where.gender = gender;
    if (status) where.accountStatus = status;
    if (subscription && subscription !== 'all') {
      where.subscription = { plan: subscription, isActive: true };
    }
    if (verified === 'true') where.profile = { isVerified: true };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, mobileNumber: true, gender: true,
          accountStatus: true, emailVerified: true, mobileVerified: true,
          lastLogin: true, lastActive: true, createdAt: true,
          profile: {
            select: {
              firstName: true, lastName: true, city: true, isVerified: true,
              govtIdVerificationStatus: true, profileCompletionPercentage: true,
            },
          },
          subscription: { select: { plan: true, isActive: true, endDate: true } },
          photos: { where: { isMain: true }, select: { url: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        preferences: true,
        subscription: true,
        _count: {
          select: {
            sentLikes: true, receivedLikes: true,
            sentMessages: true, initiatedCalls: true,
            profileViews: true, profileViewedBy: true,
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { accountStatus: status },
      select: { id: true, email: true, accountStatus: true },
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: `USER_STATUS_CHANGED_TO_${status}`,
        entityType: 'User',
        entityId: id,
        newValue: { status, reason },
      },
    });

    res.json({ success: true, data: user, message: `User status updated to ${status}` });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), accountStatus: 'INACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: id,
      },
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

// ─── REPORTS MANAGEMENT ───────────────────────────────────────────────────────

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { status, reason } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          reportedUser: { select: { id: true, email: true, accountStatus: true, profile: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    res.json({ success: true, data: { reports, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const reviewReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, action } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status, reviewNotes, reviewedAt: new Date(), reviewedBy: req.user!.userId },
    });

    // Take action on reported user if specified
    if (action && report.reportedUserId) {
      if (action === 'suspend') {
        await prisma.user.update({
          where: { id: report.reportedUserId },
          data: { accountStatus: 'SUSPENDED' },
        });
      } else if (action === 'ban') {
        await prisma.user.update({
          where: { id: report.reportedUserId },
          data: { accountStatus: 'BANNED' },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: `REPORT_REVIEWED_${status}`,
        entityType: 'Report',
        entityId: id,
        newValue: { status, action, reviewNotes },
      },
    });

    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

// ─── VERIFICATION MANAGEMENT ─────────────────────────────────────────────────

export const getVerificationRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: { govtIdVerificationStatus: 'PENDING' },
        include: {
          user: {
            select: {
              id: true, email: true, mobileNumber: true, gender: true, createdAt: true,
              photos: { orderBy: { order: 'asc' }, take: 3 },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.profile.count({ where: { govtIdVerificationStatus: 'PENDING' } }),
    ]);

    res.json({ success: true, data: { profiles, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const processVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body; // 'VERIFIED' or 'REJECTED'

    const isVerified = status === 'VERIFIED';

    await prisma.profile.update({
      where: { userId },
      data: {
        govtIdVerificationStatus: status,
        isVerified,
        verificationBadge: isVerified,
        profileVerifiedAt: isVerified ? new Date() : undefined,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'VERIFICATION',
        title: isVerified ? '✅ Profile Verified!' : '❌ Verification Rejected',
        body: isVerified
          ? 'Your profile has been verified. You now have a verification badge!'
          : `Your verification was rejected. ${notes || 'Please re-submit with valid documents.'}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: `VERIFICATION_${status}`,
        entityType: 'Profile',
        entityId: userId,
        newValue: { status, notes },
      },
    });

    res.json({ success: true, message: `Verification ${status.toLowerCase()}` });
  } catch (err) { next(err); }
};

// ─── SUBSCRIPTION MANAGEMENT ─────────────────────────────────────────────────

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { plan } = req.query;

    const where: any = { isActive: true };
    if (plan && plan !== 'all') where.plan = plan;

    const [subscriptions, total, revenue] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, email: true,
              profile: { select: { firstName: true, lastName: true, city: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.aggregate({
        where: { isActive: true },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        subscriptions, total, page, pages: Math.ceil(total / limit),
        totalRevenue: revenue._sum.amount || 0,
      },
    });
  } catch (err) { next(err); }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Daily registration trend
    const dailyRegistrations = await prisma.$queryRaw<any[]>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${since} AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Religion distribution
    const religionDist = await prisma.profile.groupBy({
      by: ['religion'],
      _count: { religion: true },
      orderBy: { _count: { religion: 'desc' } },
    });

    // City distribution
    const cityDist = await prisma.profile.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    // Age distribution
    const ageDist = await prisma.$queryRaw<any[]>`
      SELECT
        CASE
          WHEN age BETWEEN 18 AND 24 THEN '18-24'
          WHEN age BETWEEN 25 AND 29 THEN '25-29'
          WHEN age BETWEEN 30 AND 34 THEN '30-34'
          WHEN age BETWEEN 35 AND 39 THEN '35-39'
          ELSE '40+'
        END as range,
        COUNT(*) as count
      FROM profiles
      GROUP BY range
      ORDER BY range
    `;

    res.json({
      success: true,
      data: { dailyRegistrations, religionDist, cityDist, ageDist },
    });
  } catch (err) { next(err); }
};

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};
