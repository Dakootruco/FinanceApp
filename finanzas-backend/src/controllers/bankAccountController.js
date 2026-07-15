import { query } from '../config/db.js';

/**
 * Obtener todas las cuentas bancarias.
 */
export const getBankAccounts = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY name ASC';
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de una cuenta bancaria por ID.
 */
export const getBankAccountById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM bank_accounts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Cuenta bancaria no encontrada');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva cuenta bancaria.
 */
export const createBankAccount = async (req, res, next) => {
  const { name, bank_name, last_digits, balance } = req.body;

  // Validaciones básicas
  if (!name || !bank_name || !last_digits) {
    const err = new Error('Los campos name, bank_name y last_digits son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  // Validar que los últimos dígitos sean exactamente 4 números
  const digitsRegex = /^\d{4}$/;
  if (!digitsRegex.test(last_digits)) {
    const err = new Error('Los últimos dígitos de la cuenta deben ser exactamente 4 números');
    err.statusCode = 400;
    return next(err);
  }

  const numericBalance = balance !== undefined ? parseFloat(balance) : 0.00;
  if (isNaN(numericBalance)) {
    const err = new Error('El saldo (balance) debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const sql = `
      INSERT INTO bank_accounts (name, bank_name, last_digits, balance, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [
      name.trim(),
      bank_name.trim(),
      last_digits,
      numericBalance,
      req.user.id
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una cuenta bancaria existente.
 */
export const updateBankAccount = async (req, res, next) => {
  const { id } = req.params;
  const { name, bank_name, last_digits, balance } = req.body;

  if (!name || !bank_name || !last_digits) {
    const err = new Error('Los campos name, bank_name y last_digits son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  const digitsRegex = /^\d{4}$/;
  if (!digitsRegex.test(last_digits)) {
    const err = new Error('Los últimos dígitos deben ser exactamente 4 números');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const sql = `
      UPDATE bank_accounts
      SET name = $1, bank_name = $2, last_digits = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;
    const result = await query(sql, [
      name.trim(),
      bank_name.trim(),
      last_digits,
      id,
      req.user.id
    ]);

    if (result.rows.length === 0) {
      const err = new Error('Cuenta bancaria no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una cuenta bancaria.
 */
export const deleteBankAccount = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM bank_accounts WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Cuenta bancaria no encontrada');
      err.statusCode = 404;
      return next(err);
    }
    res.json({
      message: 'Cuenta bancaria eliminada correctamente',
      bankAccount: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
