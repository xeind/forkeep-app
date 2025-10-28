import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageControllers';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:matchId', authMiddleware, getMessages);

export default router;
