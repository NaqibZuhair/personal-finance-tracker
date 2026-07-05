import { Router } from 'express';
import { handleAIChat } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/chat', handleAIChat);

export default router;
