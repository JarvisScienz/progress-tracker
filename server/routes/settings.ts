import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
// All routes require authentication
router.use(authMiddleware);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router; 