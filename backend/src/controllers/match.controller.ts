import { Request, Response, NextFunction } from 'express';
import { MatchService } from '@services/match.service';
import { RecommendationService } from '@services/recommendation.service';

const matchService = new MatchService();
const recommendationService = new RecommendationService();

function getGender(req: Request): 'MALE' | 'FEMALE' {
  return (req.user?.gender as 'MALE' | 'FEMALE') || 'MALE';
}

function getPagination(req: Request) {
  return {
    page: Math.max(1, Number(req.query.page) || 1),
    limit: Math.min(100, Math.max(1, Number(req.query.limit) || 20)),
  };
}

export const getNewProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getNewProfiles(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getRecentlyActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getRecentlyActive(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getNearMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getNearMe(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getMostViewed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getMostViewed(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getMostLiked = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getMostLiked(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getPremiumProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getPremiumProfiles(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getVerifiedProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getVerifiedProfiles(req.user!.userId, getGender(req), req.query, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getRecommended = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await recommendationService.getRecommended(req.user!.userId, getGender(req), page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const likeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await matchService.likeProfile(req.user!.userId, req.params.userId);
    res.json({ success: true, data: result, message: result.isMatch ? "It's a Match! 💜" : 'Profile liked' });
  } catch (err) { next(err); }
};

export const unlikeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.unlikeProfile(req.user!.userId, req.params.userId);
    res.json({ success: true, message: 'Like removed' });
  } catch (err) { next(err); }
};

export const superLikeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.superLikeProfile(req.user!.userId, req.params.userId, req.body.message);
    res.json({ success: true, message: 'Super like sent! ⭐' });
  } catch (err) { next(err); }
};

export const favoriteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.favoriteProfile(req.user!.userId, req.params.userId);
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) { next(err); }
};

export const unfavoriteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.unfavoriteProfile(req.user!.userId, req.params.userId);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) { next(err); }
};

export const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.blockUser(req.user!.userId, req.params.userId, req.body.reason);
    res.json({ success: true, message: 'User blocked' });
  } catch (err) { next(err); }
};

export const viewProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await matchService.viewProfile(req.user!.userId, req.params.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const getLikesReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getLikesReceived(req.user!.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPagination(req);
    const result = await matchService.getFavorites(req.user!.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getCompatibilityScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const score = await recommendationService.getCompatibilityScore(req.user!.userId, req.params.userId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
};
