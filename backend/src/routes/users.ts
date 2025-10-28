import express from 'express';
import { getDiscoverUsers } from '../controllers/userControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/discover', authMiddleware, getDiscoverUsers);

export default router;
