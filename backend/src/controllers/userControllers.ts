import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { lookingFor: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });

    const swipedIds = swipedUserIds.map((swipe) => swipe.swipedId);

    const genderFilter = currentUser.lookingFor === 'Everyone' 
      ? {} 
      : { gender: currentUser.lookingFor };

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: userId },
          },
          {
            id: { notIn: swipedIds },
          },
          genderFilter,
        ],
      },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        photoUrl: true,
        photos: true,
      },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = users.length > limit;
    const resultUsers = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? resultUsers[resultUsers.length - 1].id : null;

    res.json({ 
      users: resultUsers,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
