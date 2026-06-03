import { Router } from 'express';
import {
  getMyProfile, getProfileById, updateProfile,
  uploadPhoto, setMainPhoto, deletePhoto,
  getPreferences, updatePreferences, getMyProfileViews, searchProfiles,
} from '@controllers/profile.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { updateProfileSchema, preferencesSchema } from '@utils/validators';
import { uploadRateLimit } from '@middleware/rateLimit.middleware';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();
router.use(authenticate);

// Profile CRUD
router.get('/me', getMyProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.get('/search', searchProfiles);
router.get('/views', getMyProfileViews);

// Photos
router.post('/photos', uploadRateLimit, upload.single('photo'), uploadPhoto);
router.put('/photos/:photoId/main', setMainPhoto);
router.delete('/photos/:photoId', deletePhoto);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', validate(preferencesSchema), updatePreferences);

// Public profile (authenticated)
router.get('/:id', getProfileById);

export default router;
