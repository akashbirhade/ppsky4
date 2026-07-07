import { Request, Response, NextFunction } from 'express';
import prisma from '@config/prisma';
import { AppError } from '@middleware/error.middleware';

export const submitVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { type, documentUrl, selfieUrl } = req.body;

    if (!type || !documentUrl || !selfieUrl) {
      throw new AppError('type, documentUrl, and selfieUrl are required', 400);
    }

    const validTypes = ['aadhaar', 'passport', 'driving_license', 'voter_id'];
    if (!validTypes.includes(type)) {
      throw new AppError(`Invalid document type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { govtIdVerificationStatus: true },
    });
    if (!profile) throw new AppError('Profile not found', 404);

    if (profile.govtIdVerificationStatus === 'VERIFIED') {
      return res.json({ success: true, message: 'Already verified', status: 'VERIFIED' });
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        govtIdVerificationStatus: 'PENDING',
        govtIdType: type,
      },
    });

    res.json({
      success: true,
      message: 'Verification submitted successfully. We will review within 24-48 hours.',
      status: 'PENDING',
    });
  } catch (err) {
    next(err);
  }
};

export const getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        govtIdVerificationStatus: true,
        isVerified: true,
        verificationBadge: true,
        profileVerifiedAt: true,
      },
    });

    if (!profile) throw new AppError('Profile not found', 404);

    res.json({
      success: true,
      data: {
        status: profile.govtIdVerificationStatus || 'NOT_SUBMITTED',
        isVerified: profile.isVerified,
        hasBadge: profile.verificationBadge,
        verifiedAt: profile.profileVerifiedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
