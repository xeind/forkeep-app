import prisma from '../prisma';
import type { Request, Response } from 'express';

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...safeUser } = user;

    res.json({ 
      user: safeUser
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, email, ...safeUser } = user;

    res.json({ 
      user: safeUser
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, bio, age, photoUrl, photos, province, city } = req.body;

    const updateData: any = { updatedAt: new Date() };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (age !== undefined) updateData.age = age;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (photos !== undefined) updateData.photos = photos;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ 
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

