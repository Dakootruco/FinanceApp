import { Router } from 'express';
import { 
  getBankAccounts, 
  getBankAccountById, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from '../controllers/bankAccountController.js';

const router = Router();

// Rutas de cuentas bancarias
router.get('/', getBankAccounts);
router.get('/:id', getBankAccountById);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

export default router;
