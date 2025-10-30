import express from 'express';
import { getMatches, getUnviewedMatches, markMatchAsViewed, deleteMatch } from '../controllers/matchControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getMatches);
router.get('/unviewed', authMiddleware, getUnviewedMatches);
router.post('/:matchId/view', authMiddleware, markMatchAsViewed);
router.delete('/:matchId', authMiddleware, deleteMatch);

export default router;
