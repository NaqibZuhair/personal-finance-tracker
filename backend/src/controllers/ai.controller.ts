import type { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { processAIChat } from '../services/ai.service';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(z.any()).optional().default([]),
  image: z.string().optional(),
});

export async function handleAIChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { message, history, image } = chatSchema.parse(req.body);

    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await processAIChat(req.userId, message, history, image);

    res.status(200).json({
      message: 'Successfully processed AI chat',
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
      return;
    }

    console.error('[AI Controller Error]:', error);
    res.status(500).json({
      message: error.message || 'Failed to process AI chat request',
    });
  }
}
