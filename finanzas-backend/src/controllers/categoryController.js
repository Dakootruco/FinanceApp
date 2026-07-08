import { query } from '../config/db.js';

/**
 * Obtener todas las categorías.
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY type DESC, name ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva categoría personalizada.
 */
export const createCategory = async (req, res, next) => {
  const { name, type, icon, color } = req.body;

  // Validaciones básicas
  if (!name || !type) {
    const err = new Error('El nombre y el tipo son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (type !== 'income' && type !== 'expense') {
    const err = new Error('El tipo debe ser "income" o "expense"');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Consulta parametrizada segura contra SQL Injection
    const sql = `
      INSERT INTO categories (name, type, icon, color, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [name.trim(), type, icon || null, color || '#cccccc', req.user.id];

    const result = await query(sql, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Capturar violación de restricción UNIQUE de postgres
    if (error.code === '23505') {
      const err = new Error('Ya existe una categoría con ese nombre');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

/**
 * Actualizar una categoría existente.
 */
export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, type, icon, color } = req.body;

  // Validaciones básicas
  if (!name || !type) {
    const err = new Error('El nombre y el tipo son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (type !== 'income' && type !== 'expense') {
    const err = new Error('El tipo debe ser "income" o "expense"');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const sql = `
      UPDATE categories
      SET name = $1, type = $2, icon = $3, color = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const params = [name.trim(), type, icon || null, color || '#cccccc', id, req.user.id];

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      const err = new Error('Ya existe una categoría con ese nombre');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

/**
 * Eliminar una categoría.
 */
export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      message: 'Categoría eliminada correctamente',
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
