import express from 'express';
import { getReportData } from '../controllers/reportController.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener datos de reportes avanzados
 *     description: Retorna KPIs agregados, desgloses por categoría, datos históricos de meses y métodos de pago dentro de un rango de fechas y filtro de cuenta bancaria.
 */
router.get('/', getReportData);

export default router;
