import { Router } from 'express';
import {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  adjustInvestedAmount,
  adjustChangePercentage
} from '../controllers/investmentController.js';

const router = Router();

// Rutas de inversiones
router.get('/', getInvestments);
router.get('/:id', getInvestmentById);
router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);
router.patch('/:id/adjust-amount', adjustInvestedAmount);
router.patch('/:id/adjust-percentage', adjustChangePercentage);

export default router;
