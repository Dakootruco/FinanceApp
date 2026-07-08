import { query } from '../config/db.js';

const VALID_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Otro'];

/**
 * Obtener todas las tarjetas de crédito.
 */
export const getCreditCards = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY created_at ASC';
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de una tarjeta por ID.
 */
export const getCreditCardById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Tarjeta de crédito no encontrada');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva tarjeta de crédito.
 */
export const createCreditCard = async (req, res, next) => {
  const { card_name, bank, brand, last_digits, balance, color_theme } = req.body;

  // Validaciones básicas
  if (!card_name || !bank || !brand || !last_digits) {
    const err = new Error('Los campos card_name, bank, brand y last_digits son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (!VALID_BRANDS.includes(brand)) {
    const err = new Error(`Marca inválida. Debe ser una de: ${VALID_BRANDS.join(', ')}`);
    err.statusCode = 400;
    return next(err);
  }

  // Validar que los últimos dígitos sean exactamente 4 números
  const digitsRegex = /^\d{4}$/;
  if (!digitsRegex.test(last_digits)) {
    const err = new Error('Los últimos dígitos deben ser exactamente 4 números');
    err.statusCode = 400;
    return next(err);
  }

  const numericBalance = balance !== undefined ? parseFloat(balance) : 0.00;
  if (isNaN(numericBalance)) {
    const err = new Error('El saldo (balance) debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  const finalColorTheme = color_theme ? color_theme.trim() : '#121620';

  try {
    const sql = `
      INSERT INTO credit_cards (card_name, bank, brand, last_digits, balance, color_theme, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(sql, [
      card_name.trim(),
      bank.trim(),
      brand,
      last_digits,
      numericBalance,
      finalColorTheme,
      req.user.id
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una tarjeta de crédito existente.
 */
export const updateCreditCard = async (req, res, next) => {
  const { id } = req.params;
  const { card_name, bank, brand, last_digits, balance, color_theme } = req.body;

  if (!card_name || !bank || !brand || !last_digits) {
    const err = new Error('Los campos card_name, bank, brand y last_digits son obligatorios');
    err.statusCode = 400;
    return next(err);
  }

  if (!VALID_BRANDS.includes(brand)) {
    const err = new Error(`Marca de tarjeta inválida. Debe ser una de: ${VALID_BRANDS.join(', ')}`);
    err.statusCode = 400;
    return next(err);
  }

  const digitsRegex = /^\d{4}$/;
  if (!digitsRegex.test(last_digits)) {
    const err = new Error('Los últimos dígitos deben ser exactamente 4 números');
    err.statusCode = 400;
    return next(err);
  }

  const numericBalance = parseFloat(balance);
  if (isNaN(numericBalance)) {
    const err = new Error('El saldo (balance) debe ser un número válido');
    err.statusCode = 400;
    return next(err);
  }

  const finalColorTheme = color_theme ? color_theme.trim() : '#121620';

  try {
    const sql = `
      UPDATE credit_cards
      SET card_name = $1, bank = $2, brand = $3, last_digits = $4, balance = $5, color_theme = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    const result = await query(sql, [
      card_name.trim(),
      bank.trim(),
      brand,
      last_digits,
      numericBalance,
      finalColorTheme,
      id,
      req.user.id
    ]);

    if (result.rows.length === 0) {
      const err = new Error('Tarjeta de crédito no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una tarjeta de crédito.
 */
export const deleteCreditCard = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM credit_cards WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('Tarjeta de crédito no encontrada');
      err.statusCode = 404;
      return next(err);
    }
    res.json({
      message: 'Tarjeta de crédito eliminada correctamente',
      creditCard: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
