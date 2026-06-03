import { Router } from 'express';
import {
  getNewProfiles, getRecentlyActive, getNearMe, getMostViewed, getMostLiked,
  getPremiumProfiles, getVerifiedProfiles, getRecommended,
  likeProfile, unlikeProfile, superLikeProfile,
  favoriteProfile, unfavoriteProfile, blockUser, viewProfile,
  getLikesReceived, getFavorites, getCompatibilityScore,
} from '@controllers/match.controller';
import { authenticate, requirePremium } from '@middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Discovery feeds
router.get('/new', getNewProfiles);
router.get('/recently-active', getRecentlyActive);
router.get('/near-me', getNearMe);
router.get('/most-viewed', getMostViewed);
router.get('/most-liked', getMostLiked);
router.get('/premium', getPremiumProfiles);
router.get('/verified', getVerifiedProfiles);
router.get('/recommended', getRecommended);

// My activity
router.get('/likes/received', requirePremium, getLikesReceived);
router.get('/favorites', getFavorites);

// Actions
router.post('/like/:userId', likeProfile);
router.delete('/like/:userId', unlikeProfile);
router.post('/superlike/:userId', superLikeProfile);
router.post('/favorite/:userId', favoriteProfile);
router.delete('/favorite/:userId', unfavoriteProfile);
router.post('/block/:userId', blockUser);
router.post('/view/:userId', viewProfile);

// Compatibility
router.get('/compatibility/:userId', getCompatibilityScore);

export default router;
