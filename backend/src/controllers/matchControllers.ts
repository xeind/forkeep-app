import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const formattedMatches = matches.map((match) => {
      const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
      const { passwordHash, email, ...safeUser } = matchedUser;
      const lastMessage = match.messages[0];

      return {
        id: match.id,
        matchedUser: safeUser,
        createdAt: match.createdAt,
        lastMessageAt: lastMessage?.createdAt || null,
      };
    });

    formattedMatches.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return bTime.getTime() - aTime.getTime();
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnviewedMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId, viewedByUser1: false },
          { user2Id: userId, viewedByUser2: false },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedMatches = matches.map((match) => {
      const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
      const { passwordHash, email, ...safeUser } = matchedUser;

      return {
        id: match.id,
        matchedUser: safeUser,
        createdAt: match.createdAt,
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get unviewed matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markMatchAsViewed = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updateData = match.user1Id === userId 
      ? { viewedByUser1: true }
      : { viewedByUser2: true };

    await prisma.match.update({
      where: { id: matchId },
      data: updateData,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark match as viewed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.$transaction([
      prisma.swipe.deleteMany({
        where: {
          OR: [
            { swiperId: match.user1Id, swipedId: match.user2Id },
            { swiperId: match.user2Id, swipedId: match.user1Id },
          ],
        },
      }),
      prisma.match.delete({
        where: { id: matchId },
      }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
