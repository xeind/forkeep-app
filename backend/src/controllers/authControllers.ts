import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from '../prisma';
import type { Request, Response } from 'express';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, age, birthday, gender, lookingForGenders, bio, photoUrl, province, city, photos } =
      req.body;

    // Validation of required fields
    if (!email || !password || !name || !age || !gender || !lookingForGenders) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const photosArray = photos && Array.isArray(photos) && photos.length > 0
      ? photos.filter(Boolean)
      : [];

    // Create User
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        passwordHash,
        name,
        age,
        birthday: birthday ? new Date(birthday) : null,
        showBirthday: false,
        gender,
        lookingForGenders,
        bio: bio || '',
        photoUrl: photoUrl || 'https:i.pravatar.cc/400',
        photos: photosArray,
        province: province || null,
        city: city || null,
        updatedAt: new Date(),
      },
    });

    // Generate JWT with shuffle seed for consistent user ordering
    const shuffleSeed = Math.floor(Math.random() * 1000000);
    const token = jwt.sign({ userId: user.id, shuffleSeed }, process.env.JWT_SECRET!);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      token, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with shuffle seed for consistent user ordering
    const shuffleSeed = Math.floor(Math.random() * 1000000);
    const token = jwt.sign({ userId: user.id, shuffleSeed }, process.env.JWT_SECRET!);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ 
      token, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
