import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getDiscoverUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const shuffleSeed = req.shuffleSeed || 0;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { lookingFor: true, gender: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });

    const swipedIds = swipedUserIds.map((swipe) => swipe.swipedId);

    const normalizeGenderForMatching = (lookingFor: string, userGender: string): any => {
      if (lookingFor === 'Everyone') {
        return {};
      }
      
      if (lookingFor === 'Men') {
        return { 
          gender: { 
            in: ['Male', 'Non-binary', 'Other'] 
          } 
        };
      }
      
      if (lookingFor === 'Women') {
        return { 
          gender: { 
            in: ['Female', 'Non-binary', 'Other'] 
          } 
        };
      }
      
      return { gender: lookingFor };
    };

    const buildLookingForFilter = (userGender: string): any => {
      const conditions: any[] = [{ lookingFor: 'Everyone' }];
      
      if (userGender === 'Male') {
        conditions.push({ lookingFor: 'Men' });
      } else if (userGender === 'Female') {
        conditions.push({ lookingFor: 'Women' });
      } else if (userGender === 'Non-binary' || userGender === 'Other') {
        conditions.push({ lookingFor: 'Men' });
        conditions.push({ lookingFor: 'Women' });
      }
      
      return { OR: conditions };
    };

    const genderFilter = normalizeGenderForMatching(currentUser.lookingFor, currentUser.gender);
    const lookingForFilter = buildLookingForFilter(currentUser.gender);

    const allUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: userId },
          },
          {
            id: { notIn: swipedIds },
          },
          genderFilter,
          lookingForFilter,
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
        province: true,
        city: true,
      },
    });

    const seededRandom = (seed: number) => {
      let state = seed;
      return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    };

    const shuffleArrayWithSeed = <T,>(array: T[], seed: number): T[] => {
      const shuffled = [...array];
      const random = seededRandom(seed);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledUsers = shuffleArrayWithSeed(allUsers, shuffleSeed);
    
    const startIndex = cursor ? shuffledUsers.findIndex(u => u.id === cursor) + 1 : 0;
    const endIndex = Math.min(startIndex + limit + 1, shuffledUsers.length);
    const users = shuffledUsers.slice(startIndex, endIndex);

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
