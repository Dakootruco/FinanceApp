import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import creditCardRoutes from './routes/creditCardRoutes.js';
import savingsGoalRoutes from './routes/savingsGoalRoutes.js';
import importRoutes from './routes/importRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.js';
import { requireAuth } from './middlewares/authMiddleware.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Documentación de la API (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta de prueba de salud de la API
app.get('/health', async (req, res, next) => {
  try {
    // Verificar la conexión a la base de datos
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'API de Finanzas Personales funcionando correctamente',
      dbTime: result.rows[0].now
    });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
  }
});

// Rutas de la API (protegidas con autenticación JWT de Supabase)
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/budgets', requireAuth, budgetRoutes);
app.use('/api/investments', requireAuth, investmentRoutes);
app.use('/api/credit-cards', requireAuth, creditCardRoutes);
app.use('/api/savings-goals', requireAuth, savingsGoalRoutes);
app.use('/api/transactions-import', requireAuth, importRoutes);
app.use('/api/bank-accounts', requireAuth, bankAccountRoutes);
app.use('/api/reports', requireAuth, reportRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Recurso no encontrado'
  });
});

// Middleware global para manejo de errores asíncronos
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    // Solo enviamos el stack en desarrollo para facilitar la depuración
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
