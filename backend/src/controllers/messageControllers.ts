import prisma from '../prisma';
import type { Request, Response } from 'express';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { matchId, content } = req.body;

    // Validation of inputs
    if (!matchId || !content) {
      return res.status(400).json({ error: 'Missing matchId or content' });
    }

    if (typeof content !== 'string' || content.trim().length == 0) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    // Verifying match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    // Determine the receiver
    const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;

    // Creating the message
    const message = await prisma.message.create({
      data: {
        matchId: matchId,
        senderId: userId,
        receiverId: receiverId,
        content: content.trim(),
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { matchId } = req.params;
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID required' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res
        .status(403)
        .json({ error: 'You are not a part of this match' });
    }

    const messages = await prisma.message.findMany({
      where: { matchId: matchId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
