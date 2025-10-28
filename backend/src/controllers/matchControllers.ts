import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // You could be either the one that was matched, or matches
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: true,
        user2: true,
      },
      // To sort by newest
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedMatches = matches.map((match) => {
      // Determine which user is the matched user
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
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
