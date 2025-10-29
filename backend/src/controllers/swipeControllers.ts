import prisma from '../prisma';
import type { Request, Response } from 'express';

export const createSwipe = async (req: Request, res: Response) => {
  try {
    // Get current user's ID from token
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve userId and direction from request data
    const { swipedUserId, direction } = req.body;

    if (!swipedUserId || !direction) {
      return res
        .status(400)
        .json({ error: 'Missing swipedUserId or direction' });
    }

    if (direction !== 'left' && direction !== 'right') {
      return res
        .status(400)
        .json({ error: 'Direction must be "left" or "right"' });
    }

    if (userId === swipedUserId) {
      return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    const existingSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: userId,
        swipedId: swipedUserId,
      },
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    // Create Swipe Record
    await prisma.swipe.create({
      data: {
        swiperId: userId,
        swipedId: swipedUserId,
        direction: direction,
      },
    });

    if (direction === 'right') {
      const mutualSwipe = await prisma.swipe.findFirst({
        where: {
          swiperId: swipedUserId,
          swipedId: userId,
          direction: 'right',
        },
      });

      if (mutualSwipe) {
        const [user1Id, user2Id] = userId < swipedUserId 
          ? [userId, swipedUserId]
          : [swipedUserId, userId];

        try {
          const match = await prisma.match.create({
            data: {
              user1Id,
              user2Id,
            },
          });

          console.log(`✨ Match created: ${match.id} between ${user1Id} and ${user2Id}`);

          return res.status(201).json({
            success: true,
            match: true,
            matchId: match.id,
          });
        } catch (matchError) {
          console.error('Match creation error:', matchError);
          const existingMatch = await prisma.match.findFirst({
            where: {
              user1Id,
              user2Id,
            },
          });

          if (existingMatch) {
            console.log(`Match already exists: ${existingMatch.id}`);
            return res.status(201).json({
              success: true,
              match: true,
              matchId: existingMatch.id,
            });
          }

          throw matchError;
        }
      }
    }

    res.status(201).json({
      success: true,
      match: false,
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
