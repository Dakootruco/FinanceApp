import { query } from '../config/db.js';

/**
 * Obtener todos los objetivos/planes de ahorro.
 */
export const getSavingsGoals = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY id ASC';
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de un objetivo de ahorro por ID.
 */
export const getSavingsGoalById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Objetivo de ahorro no encontrado');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo objetivo de ahorro.
 */
export const createSavingsGoal = async (req, res, next) => {
  const { name, target_amount, current_amount, color_theme } = req.body;

  // Validaciones
  if (!name || target_amount === undefined) {
    const err = new Error('Los campos "name" y "target_amount" son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  const numericTarget = parseFloat(target_amount);
  if (isNaN(numericTarget) || numericTarget < 0) {
    const err = new Error('La meta de ahorro (target_amount) debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const numericCurrent = current_amount !== undefined ? parseFloat(current_amount) : 0.00;
  if (isNaN(numericCurrent) || numericCurrent < 0) {
    const err = new Error('El saldo de ahorro actual (current_amount) debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const finalColorTheme = color_theme ? color_theme.trim() : '#6366f1';

  try {
    const sql = `
      INSERT INTO savings_goals (name, target_amount, current_amount, color_theme, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [
      name.trim(),
      numericTarget,
      numericCurrent,
      finalColorTheme,
      req.user.id
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un objetivo de ahorro existente.
 */
export const updateSavingsGoal = async (req, res, next) => {
  const { id } = req.params;
  const { name, target_amount, current_amount, color_theme } = req.body;

  // Validaciones
  if (!name || target_amount === undefined || current_amount === undefined) {
    const err = new Error('Los campos "name", "target_amount" y "current_amount" son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  const numericTarget = parseFloat(target_amount);
  if (isNaN(numericTarget) || numericTarget < 0) {
    const err = new Error('La meta de ahorro (target_amount) debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const numericCurrent = parseFloat(current_amount);
  if (isNaN(numericCurrent) || numericCurrent < 0) {
    const err = new Error('El saldo de ahorro actual (current_amount) debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const finalColorTheme = color_theme ? color_theme.trim() : '#6366f1';

  try {
    const sql = `
      UPDATE savings_goals
      SET name = $1, target_amount = $2, current_amount = $3, color_theme = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const result = await query(sql, [
      name.trim(),
      numericTarget,
      numericCurrent,
      finalColorTheme,
      id,
      req.user.id
    ]);

    if (result.rows.length === 0) {
      const err = new Error('Objetivo de ahorro no encontrado');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un objetivo de ahorro.
 */
export const deleteSavingsGoal = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Objetivo de ahorro no encontrado');
      err.statusCode = 404;
      return next(err);
    }
    res.json({
      message: 'Objetivo de ahorro eliminado correctamente',
      savingsGoal: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajustar el monto actual de ahorro (añadir/retirar capital de ahorro).
 */
export const adjustSavingsGoalAmount = async (req, res, next) => {
  const { id } = req.params;
  const { amount } = req.body;

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    const err = new Error('El monto de ajuste (amount) debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // 1. Obtener el objetivo actual
    const checkGoal = await query('SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (checkGoal.rows.length === 0) {
      const err = new Error('Objetivo de ahorro no encontrado');
      err.statusCode = 404;
      return next(err);
    }

    const currentGoal = checkGoal.rows[0];
    const newCurrentAmount = parseFloat(currentGoal.current_amount) + numericAmount;

    // 2. Validar que no quede en negativo
    if (newCurrentAmount < 0) {
      const err = new Error(`El retiro excede los fondos ahorrados disponibles. Ahorro actual: $${currentGoal.current_amount}`);
      err.statusCode = 400;
      return next(err);
    }

    // 3. Actualizar el saldo
    const updateSql = `
      UPDATE savings_goals
      SET current_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await query(updateSql, [newCurrentAmount, id, req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
