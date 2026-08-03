import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import profileRoutes from './routes/profileRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.js';
import { requireAuth } from './middlewares/authMiddleware.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limitar a 200 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' }
});

// Middlewares globales de Seguridad y Básicos
app.use(helmet()); // Protege cabeceras HTTP
app.use(limiter);  // Aplica rate-limit a todas las rutas
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

// Endpoint público para resolver email por username (usado en login)
app.get('/api/auth/email-by-username/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      'SELECT email FROM public.users WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ email: result.rows[0].email });
  } catch (error) {
    next(error);
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
app.use('/api/profile', requireAuth, profileRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Recurso no encontrado'
  });
});

// Middleware global para manejo de errores asíncronos
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  
  let errorMessage = err.message || 'Error interno del servidor';
  let statusCode = err.statusCode || 500;

  // Manejo y traducción de restricciones de base de datos PostgreSQL
  if (err.code === '23505') {
    statusCode = 400; // Bad Request para violación de unicidad
    const constraint = err.constraint || '';
    if (constraint.includes('bank_accounts')) {
      errorMessage = 'Ya existe una cuenta bancaria con este nombre. Por favor, elige un nombre único.';
    } else if (constraint.includes('categories')) {
      errorMessage = 'Ya existe una categoría con este nombre. Por favor, elige un nombre único.';
    } else if (constraint.includes('credit_cards')) {
      errorMessage = 'Ya existe una tarjeta de crédito con este nombre. Por favor, elige un nombre único.';
    } else if (constraint.includes('savings_goals')) {
      errorMessage = 'Ya existe una meta de ahorro con este nombre. Por favor, elige un nombre único.';
    } else if (constraint.includes('budgets')) {
      errorMessage = 'Ya tienes un presupuesto activo configurado para esta categoría.';
    } else {
      errorMessage = 'Ya existe un registro con este nombre o valor duplicado. Por favor, especifica valores únicos.';
    }
  }

  res.status(statusCode).json({
    error: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
