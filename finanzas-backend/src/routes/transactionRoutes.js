import { Router } from 'express';
import { getTransactions, createTransaction, deleteTransaction, updateTransaction, purgeAllTransactions, purgeAllData } from '../controllers/transactionController.js';

const router = Router();

// Rutas de transacciones
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/purge/all', purgeAllTransactions);
router.delete('/purge/all-data', purgeAllData);
router.delete('/:id', deleteTransaction);

export default router;
