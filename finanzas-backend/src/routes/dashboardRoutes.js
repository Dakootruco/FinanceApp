import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = Router();

// Ruta del dashboard
router.get('/', getDashboardData);

export default router;
