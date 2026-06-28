import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & { userId?: string };

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
