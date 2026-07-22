"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("@controllers/match.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Discovery feeds
router.get('/new', match_controller_1.getNewProfiles);
router.get('/recently-active', match_controller_1.getRecentlyActive);
router.get('/near-me', match_controller_1.getNearMe);
router.get('/most-viewed', match_controller_1.getMostViewed);
router.get('/most-liked', match_controller_1.getMostLiked);
router.get('/premium', match_controller_1.getPremiumProfiles);
router.get('/verified', match_controller_1.getVerifiedProfiles);
router.get('/recommended', match_controller_1.getRecommended);
// My activity
router.get('/likes/received', auth_middleware_1.requirePremium, match_controller_1.getLikesReceived);
router.get('/likes/sent', match_controller_1.getLikesSent);
router.get('/views/by-me', match_controller_1.getViewedByMe);
router.get('/favorites', match_controller_1.getFavorites);
// Actions
router.post('/like/:userId', match_controller_1.likeProfile);
router.delete('/like/:userId', match_controller_1.unlikeProfile);
router.post('/superlike/:userId', match_controller_1.superLikeProfile);
router.post('/favorite/:userId', match_controller_1.favoriteProfile);
router.delete('/favorite/:userId', match_controller_1.unfavoriteProfile);
router.post('/block/:userId', match_controller_1.blockUser);
router.post('/view/:userId', match_controller_1.viewProfile);
// Compatibility
router.get('/compatibility/:userId', match_controller_1.getCompatibilityScore);
exports.default = router;
//# sourceMappingURL=match.routes.js.map