import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import prisma from '../lib/prisma';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    setAuthCookie(res, token);

    res.status(200).json({
      message: 'Logged in successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
