"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("@controllers/profile.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const validate_middleware_1 = require("@middleware/validate.middleware");
const validators_1 = require("@utils/validators");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Profile CRUD
router.get('/me', profile_controller_1.getMyProfile);
router.put('/me', (0, validate_middleware_1.validate)(validators_1.updateProfileSchema), profile_controller_1.updateProfile);
router.get('/search', profile_controller_1.searchProfiles);
router.get('/views', profile_controller_1.getMyProfileViews);
// Photos
router.post('/photos', rateLimit_middleware_1.uploadRateLimit, upload.single('photo'), profile_controller_1.uploadPhoto);
router.put('/photos/:photoId/main', profile_controller_1.setMainPhoto);
router.delete('/photos/:photoId', profile_controller_1.deletePhoto);
// Preferences
router.get('/preferences', profile_controller_1.getPreferences);
router.put('/preferences', (0, validate_middleware_1.validate)(validators_1.preferencesSchema), profile_controller_1.updatePreferences);
// Public profile (authenticated)
router.get('/:id', profile_controller_1.getProfileById);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map