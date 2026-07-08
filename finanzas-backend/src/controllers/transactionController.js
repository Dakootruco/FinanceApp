import { query } from '../config/db.js';

/**
 * Obtener transacciones con filtros opcionales (tipo, categoría, rango de fechas).
 */
export const getTransactions = async (req, res, next) => {
  const { type, category_id, startDate, endDate } = req.query;

  try {
    let sql = `
      SELECT t.id, t.amount, t.description, t.type, t.date, t.category_id, t.bank_account_id,
             c.name as category_name, c.color as category_color, c.icon as category_icon,
             ba.name as bank_account_name, ba.last_digits as bank_account_digits
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
      WHERE t.user_id = $1
    `;
    const params = [req.user.id];

    // Filtro por tipo ('income' o 'expense')
    if (type) {
      if (type !== 'income' && type !== 'expense') {
        const err = new Error('El tipo de filtro debe ser "income" o "expense"');
        err.statusCode = 400;
        return next(err);
      }
      params.push(type);
      sql += ` AND t.type = $${params.length}`;
    }

    // Filtro por categoría
    if (category_id) {
      params.push(parseInt(category_id, 10));
      sql += ` AND t.category_id = $${params.length}`;
    }

    // Filtro por rango de fechas (Fecha Inicio)
    if (startDate) {
      params.push(startDate); // Debe ser formato YYYY-MM-DD
      sql += ` AND t.date >= $${params.length}`;
    }

    // Filtro por rango de fechas (Fecha Fin)
    if (endDate) {
      params.push(endDate); // Debe ser formato YYYY-MM-DD
      sql += ` AND t.date <= $${params.length}`;
    }

    // Ordenar por fecha descendente (más recientes primero) e ID descendente
    sql += ' ORDER BY t.date DESC, t.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar una nueva transacción.
 */
export const createTransaction = async (req, res, next) => {
  const { amount, description, type, date, category_id, bank_account_id } = req.body;

  // Validaciones obligatorias
  if (amount === undefined || !description || !type) {
    const err = new Error('Los campos monto, descripción y tipo son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const err = new Error('El monto debe ser un número mayor a 0');
    err.statusCode = 400;
    return next(err);
  }

  if (type !== 'income' && type !== 'expense') {
    const err = new Error('El tipo debe ser "income" o "expense"');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Si se especificó una categoría, validar que exista y que coincida con el tipo (ingreso/gasto)
    if (category_id) {
      const catCheck = await query('SELECT type FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [category_id, req.user.id]);
      if (catCheck.rows.length === 0) {
        const err = new Error('La categoría especificada no existe');
        err.statusCode = 400;
        return next(err);
      }
      
      if (catCheck.rows[0].type !== type) {
        const err = new Error(`La categoría elegida es de tipo "${catCheck.rows[0].type}" pero la transacción es de tipo "${type}"`);
        err.statusCode = 400;
        return next(err);
      }
    }

    // Si se especificó una cuenta de banco, validar que exista
    if (bank_account_id) {
      const bankCheck = await query('SELECT id FROM bank_accounts WHERE id = $1 AND user_id = $2', [bank_account_id, req.user.id]);
      if (bankCheck.rows.length === 0) {
        const err = new Error('La cuenta bancaria especificada no existe o no te pertenece');
        err.statusCode = 400;
        return next(err);
      }
    }

    // Insertar la transacción
    const sql = `
      INSERT INTO transactions (amount, description, type, date, category_id, bank_account_id, user_id)
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7)
      RETURNING *
    `;
    const params = [
      numericAmount,
      description.trim(),
      type,
      date || null,
      category_id || null,
      bank_account_id || null,
      req.user.id
    ];

    const result = await query(sql, params);
    
    // Obtener los datos completos de la transacción con la categoría y la cuenta bancaria para la respuesta
    const insertedId = result.rows[0].id;
    const fullResult = await query(`
      SELECT t.id, t.amount, t.description, t.type, t.date, t.category_id, t.bank_account_id,
             c.name as category_name, c.color as category_color, c.icon as category_icon,
             ba.name as bank_account_name, ba.last_digits as bank_account_digits
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
      WHERE t.id = $1
    `, [insertedId]);

    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una transacción por ID.
 */
export const deleteTransaction = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    
    if (result.rows.length === 0) {
      const err = new Error('Transacción no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ message: 'Transacción eliminada correctamente', transaction: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una transacción existente (p. ej., cambiar su categoría).
 */
export const updateTransaction = async (req, res, next) => {
  const { id } = req.params;
  const { category_id, bank_account_id } = req.body;

  try {
    // Si se especifica category_id, verificar que exista
    if (category_id !== undefined && category_id !== null) {
      const catCheck = await query('SELECT type FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [category_id, req.user.id]);
      if (catCheck.rows.length === 0) {
        const err = new Error('La categoría especificada no existe');
        err.statusCode = 400;
        return next(err);
      }
    }

    // Si se especifica bank_account_id, verificar que exista
    if (bank_account_id !== undefined && bank_account_id !== null) {
      const bankCheck = await query('SELECT id FROM bank_accounts WHERE id = $1 AND user_id = $2', [bank_account_id, req.user.id]);
      if (bankCheck.rows.length === 0) {
        const err = new Error('La cuenta bancaria especificada no existe o no te pertenece');
        err.statusCode = 400;
        return next(err);
      }
    }

    // Actualizar la transacción (soportando opcionalmente la actualización de ambos o uno solo)
    let sql = 'UPDATE transactions SET';
    const params = [];
    
    if (category_id !== undefined) {
      params.push(category_id || null);
      sql += ` category_id = $${params.length}`;
    }
    
    if (bank_account_id !== undefined) {
      if (params.length > 0) sql += ',';
      params.push(bank_account_id || null);
      sql += ` bank_account_id = $${params.length}`;
    }

    // Si no se pasó ninguno de los dos campos editables
    if (params.length === 0) {
      const err = new Error('No se enviaron campos válidos para actualizar');
      err.statusCode = 400;
      return next(err);
    }

    params.push(id);
    params.push(req.user.id);
    sql += ` WHERE id = $${params.length - 1} AND user_id = $${params.length} RETURNING *`;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      const err = new Error('Transacción no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    // Obtener la transacción completa con datos de categoría y banco actualizados
    const fullResult = await query(`
      SELECT t.id, t.amount, t.description, t.type, t.date, t.category_id, t.bank_account_id,
             c.name as category_name, c.color as category_color, c.icon as category_icon,
             ba.name as bank_account_name, ba.last_digits as bank_account_digits
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
      WHERE t.id = $1
    `, [id]);

    res.json(fullResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar todas las transacciones.
 */
export const purgeAllTransactions = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM transactions WHERE user_id = $1 RETURNING *', [req.user.id]);
    res.json({ 
      message: 'Todos tus movimientos han sido eliminados correctamente', 
      count: result.rowCount 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar todos los datos y reiniciar la base de datos a su estado inicial.
 */
export const purgeAllData = async (req, res, next) => {
  try {
    // Eliminar datos en orden para respetar las claves foráneas
    await query('DELETE FROM transactions WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM budgets WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM investments WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM credit_cards WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM savings_goals WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM bank_accounts WHERE user_id = $1', [req.user.id]);

    // Cuentas bancarias predeterminadas (se deja vacío, el efectivo es ahora manual/sin cuenta)

    // Presupuestos predeterminados
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 10000.00, $1 FROM categories WHERE name = 'Comida / Supermercado' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 1500.00, $1 FROM categories WHERE name = 'Transporte' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 25000.00, $1 FROM categories WHERE name = 'Vivienda / Alquiler' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 5000.00, $1 FROM categories WHERE name = 'Servicios (Luz, Agua, Internet)' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 3000.00, $1 FROM categories WHERE name = 'Salud' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 4000.00, $1 FROM categories WHERE name = 'Entretenimiento / Ocio' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 5000.00, $1 FROM categories WHERE name = 'Educación' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);
    await query(`
      INSERT INTO budgets (category_id, limit_amount, user_id)
      SELECT id, 2000.00, $1 FROM categories WHERE name = 'Otros Gastos' AND type = 'expense'
      ON CONFLICT (category_id, user_id) DO NOTHING;
    `, [req.user.id]);

    // Inversiones predeterminadas (se deja vacío a petición del usuario)

    // Tarjetas de crédito predeterminadas (se deja vacío a petición del usuario)

    // Planes de ahorro predeterminados (solo Auto nuevo con balance 0)
    await query(`
      INSERT INTO savings_goals (name, target_amount, current_amount, color_theme, user_id) VALUES
      ('Auto nuevo', 25000.00, 0.00, '#6366f1', $1)
    `, [req.user.id]);

    res.json({ 
      message: 'Todos tus datos de la aplicación han sido restablecidos con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

