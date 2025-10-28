import express from 'express';
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
} from '../controllers/profileControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.get('/:userId', authMiddleware, getUserProfile);

export default router;
