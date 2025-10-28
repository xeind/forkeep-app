import express from 'express';
import { createSwipe } from '../controllers/swipeControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, createSwipe);

export default router;
