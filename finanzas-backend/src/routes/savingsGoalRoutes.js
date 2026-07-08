import { Router } from 'express';
import {
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  adjustSavingsGoalAmount
} from '../controllers/savingsGoalController.js';

const router = Router();

router.get('/', getSavingsGoals);
router.get('/:id', getSavingsGoalById);
router.post('/', createSavingsGoal);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);
router.patch('/:id/adjust-amount', adjustSavingsGoalAmount);

export default router;
