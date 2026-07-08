import { query } from '../config/db.js';

/**
 * Obtener todos los presupuestos configurados con los datos de sus categorías.
 */
export const getBudgets = async (req, res, next) => {
  try {
    const sql = `
      SELECT b.id, b.category_id, b.limit_amount,
             c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = $1
      ORDER BY c.name ASC
    `;
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar o actualizar un límite de presupuesto para una categoría.
 */
export const upsertBudget = async (req, res, next) => {
  const { category_id, limit_amount } = req.body;

  // Validaciones básicas
  if (category_id === undefined || limit_amount === undefined) {
    const err = new Error('Los campos category_id y limit_amount son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  const numericLimit = parseFloat(limit_amount);
  if (isNaN(numericLimit) || numericLimit < 0) {
    const err = new Error('El límite de presupuesto debe ser un número mayor o igual a 0');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Validar que la categoría exista y sea de tipo 'expense'
    const catCheck = await query('SELECT type FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [category_id, req.user.id]);
    if (catCheck.rows.length === 0) {
      const err = new Error('La categoría especificada no existe');
      err.statusCode = 404;
      return next(err);
    }

    if (catCheck.rows[0].type !== 'expense') {
      const err = new Error('Solo se pueden establecer límites de presupuesto en categorías de tipo gasto (expense)');
      err.statusCode = 400;
      return next(err);
    }

    // Guardar o actualizar en la base de datos (Upsert)
    const sql = `
      INSERT INTO budgets (category_id, limit_amount, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (category_id, user_id) 
      DO UPDATE SET limit_amount = EXCLUDED.limit_amount
      RETURNING id
    `;
    const result = await query(sql, [parseInt(category_id, 10), numericLimit, req.user.id]);
    const budgetId = result.rows[0].id;

    // Obtener el presupuesto completo con detalles de categoría
    const detailSql = `
      SELECT b.id, b.category_id, b.limit_amount,
             c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1 AND b.user_id = $2
    `;
    const finalResult = await query(detailSql, [budgetId, req.user.id]);
    res.status(200).json(finalResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar el presupuesto para resetear el límite de una categoría.
 */
export const deleteBudget = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      message: 'Presupuesto eliminado correctamente',
      budget: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
