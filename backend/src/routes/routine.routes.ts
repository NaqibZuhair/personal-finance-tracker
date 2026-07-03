import { Router } from 'express';
import {
  createRoutine,
  deleteRoutine,
  executeRoutine,
  getRoutines,
  updateRoutine,
} from '../controllers/routine.controller';

const router = Router();

router.get('/', getRoutines);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);
router.post('/:id/execute', executeRoutine);

export default router;
