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

    // Filter: What gender identities does the current user want to see?
    // lookingFor: "Men" | "Women" | "Everyone"
    // Maps to gender: "Male" | "Female" | "Non-binary" | "Other"
    const normalizeGenderForMatching = (lookingFor: string): any => {
      if (lookingFor === 'Everyone') {
        return {}; // No filter, show all genders
      }

      if (lookingFor === 'Men') {
        return {
          gender: 'Male', // Show only people who identify as Male
        };
      }

      if (lookingFor === 'Women') {
        return {
          gender: 'Female', // Show only people who identify as Female
        };
      }

      return {}; // Fallback: show everyone
    };

    // Filter: Who should see the current user based on their gender identity?
    // If user identifies as "Male", show them to people looking for "Men"
    // If user identifies as "Female", show them to people looking for "Women"
    // Always include people looking for "Everyone"
    const buildLookingForFilter = (userGender: string): any => {
      const conditions: any[] = [{ lookingFor: 'Everyone' }];

      if (userGender === 'Male') {
        conditions.push({ lookingFor: 'Men' });
      } else if (userGender === 'Female') {
        conditions.push({ lookingFor: 'Women' });
      }
      // Note: Non-binary and Other identities will only be shown to people looking for "Everyone"

      return { OR: conditions };
    };

    const genderFilter = normalizeGenderForMatching(currentUser.lookingFor);
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
    });

    const seededRandom = (seed: number) => {
      let state = seed;
      return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    };

    const shuffleArrayWithSeed = <T>(array: T[], seed: number): T[] => {
      const shuffled = [...array];
      const random = seededRandom(seed);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledUsers = shuffleArrayWithSeed(allUsers, shuffleSeed);

    const startIndex = cursor
      ? shuffledUsers.findIndex((u) => u.id === cursor) + 1
      : 0;
    const endIndex = Math.min(startIndex + limit + 1, shuffledUsers.length);
    const users = shuffledUsers.slice(startIndex, endIndex);

    const hasMore = users.length > limit;
    const resultUsers = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? resultUsers[resultUsers.length - 1].id : null;

    const usersWithPrivacy = resultUsers.map((user) => ({
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      photoUrl: user.photoUrl,
      photos: user.photos,
      province: user.province,
      city: user.city,
      birthday: user.showBirthday ? user.birthday : null,
    }));

    res.json({
      users: usersWithPrivacy,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
