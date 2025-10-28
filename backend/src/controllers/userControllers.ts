import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current user's preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { lookingFor: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found!' });
    }

    // All users that has already swiped on
    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });

    const swipedIds = swipedUserIds.map((swipe) => swipe.swipedId);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: userId },
          },
          {
            id: { notIn: swipedIds },
          },
          {
            gender: currentUser.lookingFor,
          },
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
      take: 20,
    });

    res.json({ users });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
