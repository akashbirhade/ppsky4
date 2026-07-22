"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompatibilityScore = exports.getFavorites = exports.getViewedByMe = exports.getLikesSent = exports.getLikesReceived = exports.viewProfile = exports.blockUser = exports.unfavoriteProfile = exports.favoriteProfile = exports.superLikeProfile = exports.unlikeProfile = exports.likeProfile = exports.getRecommended = exports.getVerifiedProfiles = exports.getPremiumProfiles = exports.getMostLiked = exports.getMostViewed = exports.getNearMe = exports.getRecentlyActive = exports.getNewProfiles = void 0;
const match_service_1 = require("@services/match.service");
const recommendation_service_1 = require("@services/recommendation.service");
const matchService = new match_service_1.MatchService();
const recommendationService = new recommendation_service_1.RecommendationService();
function getGender(req) {
    return req.user?.gender || 'MALE';
}
function getPagination(req) {
    return {
        page: Math.max(1, Number(req.query.page) || 1),
        limit: Math.min(100, Math.max(1, Number(req.query.limit) || 20)),
    };
}
const getNewProfiles = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getNewProfiles(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getNewProfiles = getNewProfiles;
const getRecentlyActive = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getRecentlyActive(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getRecentlyActive = getRecentlyActive;
const getNearMe = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getNearMe(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getNearMe = getNearMe;
const getMostViewed = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getMostViewed(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getMostViewed = getMostViewed;
const getMostLiked = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getMostLiked(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getMostLiked = getMostLiked;
const getPremiumProfiles = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getPremiumProfiles(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getPremiumProfiles = getPremiumProfiles;
const getVerifiedProfiles = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getVerifiedProfiles(req.user.userId, getGender(req), req.query, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getVerifiedProfiles = getVerifiedProfiles;
const getRecommended = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await recommendationService.getRecommended(req.user.userId, getGender(req), page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getRecommended = getRecommended;
const likeProfile = async (req, res, next) => {
    try {
        const result = await matchService.likeProfile(req.user.userId, req.params.userId);
        res.json({ success: true, data: result, message: result.isMatch ? "It's a Match! 💜" : 'Profile liked' });
    }
    catch (err) {
        next(err);
    }
};
exports.likeProfile = likeProfile;
const unlikeProfile = async (req, res, next) => {
    try {
        await matchService.unlikeProfile(req.user.userId, req.params.userId);
        res.json({ success: true, message: 'Like removed' });
    }
    catch (err) {
        next(err);
    }
};
exports.unlikeProfile = unlikeProfile;
const superLikeProfile = async (req, res, next) => {
    try {
        await matchService.superLikeProfile(req.user.userId, req.params.userId, req.body.message);
        res.json({ success: true, message: 'Super like sent! ⭐' });
    }
    catch (err) {
        next(err);
    }
};
exports.superLikeProfile = superLikeProfile;
const favoriteProfile = async (req, res, next) => {
    try {
        await matchService.favoriteProfile(req.user.userId, req.params.userId);
        res.json({ success: true, message: 'Added to favorites' });
    }
    catch (err) {
        next(err);
    }
};
exports.favoriteProfile = favoriteProfile;
const unfavoriteProfile = async (req, res, next) => {
    try {
        await matchService.unfavoriteProfile(req.user.userId, req.params.userId);
        res.json({ success: true, message: 'Removed from favorites' });
    }
    catch (err) {
        next(err);
    }
};
exports.unfavoriteProfile = unfavoriteProfile;
const blockUser = async (req, res, next) => {
    try {
        await matchService.blockUser(req.user.userId, req.params.userId, req.body.reason);
        res.json({ success: true, message: 'User blocked' });
    }
    catch (err) {
        next(err);
    }
};
exports.blockUser = blockUser;
const viewProfile = async (req, res, next) => {
    try {
        await matchService.viewProfile(req.user.userId, req.params.userId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.viewProfile = viewProfile;
const getLikesReceived = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getLikesReceived(req.user.userId, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getLikesReceived = getLikesReceived;
const getLikesSent = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getLikesSent(req.user.userId, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getLikesSent = getLikesSent;
const getViewedByMe = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getViewedByMe(req.user.userId, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getViewedByMe = getViewedByMe;
const getFavorites = async (req, res, next) => {
    try {
        const { page, limit } = getPagination(req);
        const result = await matchService.getFavorites(req.user.userId, page, limit);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.getFavorites = getFavorites;
const getCompatibilityScore = async (req, res, next) => {
    try {
        const score = await recommendationService.getCompatibilityScore(req.user.userId, req.params.userId);
        res.json({ success: true, data: score });
    }
    catch (err) {
        next(err);
    }
};
exports.getCompatibilityScore = getCompatibilityScore;
//# sourceMappingURL=match.controller.js.map