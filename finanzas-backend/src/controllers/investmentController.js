import { query } from '../config/db.js';

// Categorías de inversión válidas
const VALID_CATEGORIES = ['Bolsa', 'Cripto', 'Bienes Raíces', 'Fondo Mutuo', 'Renta Fija', 'Otros'];

/**
 * Consulta SQL base para obtener inversiones con cálculos en tiempo real
 */
const BASE_SELECT_SQL = `
  SELECT id, name, category, amount_invested, change_percentage,
         (amount_invested * (1 + change_percentage / 100))::numeric(12, 2) AS current_value,
         (amount_invested * (change_percentage / 100))::numeric(12, 2) AS net_return,
         created_at, updated_at
  FROM investments
`;

/**
 * Obtener todas las inversiones.
 */
export const getInvestments = async (req, res, next) => {
  try {
    const sql = `${BASE_SELECT_SQL} WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de una inversión específica por ID.
 */
export const getInvestmentById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `${BASE_SELECT_SQL} WHERE id = $1 AND user_id = $2`;
    const result = await query(sql, [id, req.user.id]);

    if (result.rows.length === 0) {
      const err = new Error('Inversión no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva inversión.
 */
export const createInvestment = async (req, res, next) => {
  const { name, category, amount_invested, change_percentage } = req.body;

  // Validaciones básicas
  if (!name || !category || amount_invested === undefined) {
    const err = new Error('Los campos name, category y amount_invested son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (!VALID_CATEGORIES.includes(category)) {
    const err = new Error(`Categoría inválida. Debe ser una de: ${VALID_CATEGORIES.join(', ')}`);
    err.statusCode = 400;
    return next(err);
  }

  const numericAmount = parseFloat(amount_invested);
  if (isNaN(numericAmount) || numericAmount < 0) {
    const err = new Error('El monto invertido debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const numericPercentage = change_percentage !== undefined ? parseFloat(change_percentage) : 0.00;
  if (isNaN(numericPercentage)) {
    const err = new Error('El porcentaje de cambio debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const insertSql = `
      INSERT INTO investments (name, category, amount_invested, change_percentage, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await query(insertSql, [name.trim(), category, numericAmount, numericPercentage, req.user.id]);
    const investmentId = result.rows[0].id;

    // Obtener los datos completos calculados
    const detailSql = `${BASE_SELECT_SQL} WHERE id = $1 AND user_id = $2`;
    const finalResult = await query(detailSql, [investmentId, req.user.id]);

    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar datos generales de una inversión.
 */
export const updateInvestment = async (req, res, next) => {
  const { id } = req.params;
  const { name, category, amount_invested, change_percentage } = req.body;

  if (!name || !category || amount_invested === undefined || change_percentage === undefined) {
    const err = new Error('Los campos name, category, amount_invested y change_percentage son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (!VALID_CATEGORIES.includes(category)) {
    const err = new Error(`Categoría inválida. Debe ser una de: ${VALID_CATEGORIES.join(', ')}`);
    err.statusCode = 400;
    return next(err);
  }

  const numericAmount = parseFloat(amount_invested);
  if (isNaN(numericAmount) || numericAmount < 0) {
    const err = new Error('El monto invertido debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  const numericPercentage = parseFloat(change_percentage);
  if (isNaN(numericPercentage)) {
    const err = new Error('El porcentaje de cambio debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const updateSql = `
      UPDATE investments
      SET name = $1, category = $2, amount_invested = $3, change_percentage = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING id
    `;
    const result = await query(updateSql, [name.trim(), category, numericAmount, numericPercentage, id, req.user.id]);

    if (result.rows.length === 0) {
      const err = new Error('Inversión no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    const detailSql = `${BASE_SELECT_SQL} WHERE id = $1 AND user_id = $2`;
    const finalResult = await query(detailSql, [id, req.user.id]);

    res.json(finalResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una inversión.
 */
export const deleteInvestment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM investments WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);

    if (result.rows.length === 0) {
      const err = new Error('Inversión no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      message: 'Inversión eliminada correctamente',
      investment: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajustar el capital invertido (Aumentar o retirar capital).
 */
export const adjustInvestedAmount = async (req, res, next) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (amount === undefined) {
    const err = new Error('El campo amount (monto a ajustar) es obligatorio');
    err.statusCode = 400;
    return next(err);
  }

  const adjustment = parseFloat(amount);
  if (isNaN(adjustment) || adjustment === 0) {
    const err = new Error('El monto de ajuste debe ser un número diferente de cero');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Verificar si existe la inversión
    const checkResult = await query('SELECT amount_invested FROM investments WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      const err = new Error('Inversión no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    const currentInvested = parseFloat(checkResult.rows[0].amount_invested);
    const newInvested = currentInvested + adjustment;

    if (newInvested < 0) {
      const err = new Error(`Monto de retiro inválido. El capital invertido restante no puede ser menor a 0. Capital actual: ${currentInvested}`);
      err.statusCode = 400;
      return next(err);
    }

    const updateSql = `
      UPDATE investments
      SET amount_invested = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id
    `;
    await query(updateSql, [newInvested, id, req.user.id]);

    const detailSql = `${BASE_SELECT_SQL} WHERE id = $1 AND user_id = $2`;
    const finalResult = await query(detailSql, [id, req.user.id]);

    res.json(finalResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Ajustar el rendimiento porcentual (subida o bajada de la acción / activo).
 */
export const adjustChangePercentage = async (req, res, next) => {
  const { id } = req.params;
  const { change_percentage } = req.body;

  if (change_percentage === undefined) {
    const err = new Error('El campo change_percentage es obligatorio');
    err.statusCode = 400;
    return next(err);
  }

  const percentage = parseFloat(change_percentage);
  if (isNaN(percentage)) {
    const err = new Error('El porcentaje de cambio debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const updateSql = `
      UPDATE investments
      SET change_percentage = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id
    `;
    const result = await query(updateSql, [percentage, id, req.user.id]);

    if (result.rows.length === 0) {
      const err = new Error('Inversión no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    const detailSql = `${BASE_SELECT_SQL} WHERE id = $1 AND user_id = $2`;
    const finalResult = await query(detailSql, [id, req.user.id]);

    res.json(finalResult.rows[0]);
  } catch (error) {
    next(error);
  }
};
