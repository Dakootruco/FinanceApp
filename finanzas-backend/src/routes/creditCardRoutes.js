import { Router } from 'express';
import {
  getCreditCards,
  getCreditCardById,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard
} from '../controllers/creditCardController.js';

const router = Router();

// Rutas de tarjetas de crédito
router.get('/', getCreditCards);
router.get('/:id', getCreditCardById);
router.post('/', createCreditCard);
router.put('/:id', updateCreditCard);
router.delete('/:id', deleteCreditCard);

export default router;
