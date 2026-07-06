import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export async function getUniqueTags(req: AuthRequest, res: Response) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        tags: {
          isEmpty: false,
        },
      },
      select: {
        tags: true,
      },
    });

    const tagSet = new Set<string>();
    for (const tx of transactions) {
      if (tx.tags && Array.isArray(tx.tags)) {
        for (const tag of tx.tags) {
          if (tag && typeof tag === 'string') {
            tagSet.add(tag.toLowerCase().trim());
          }
        }
      }
    }

    const uniqueTags = Array.from(tagSet).sort();
    return res.status(200).json({ data: uniqueTags });
  } catch (error) {
    console.error('Failed to get unique tags:', error);
    return res.status(500).json({ message: 'Failed to retrieve tags' });
  }
}
