import express from 'express';
import { getMatches } from '../controllers/matchControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getMatches);

export default router;
