import express from 'express';
import { getMatches, deleteMatch } from '../controllers/matchControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getMatches);
router.delete('/:matchId', authMiddleware, deleteMatch);

export default router;
