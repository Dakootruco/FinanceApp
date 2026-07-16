import pool from '../config/db.js';

/**
 * Obtener el perfil del usuario actual.
 */
export const getProfile = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, name, email, username, currency, theme, created_at FROM public.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const email = req.user.email;
      const name = req.user.user_metadata?.name || 'Usuario';
      const username = req.user.user_metadata?.username || email.split('@')[0];

      const insertResult = await pool.query(
        'INSERT INTO public.users (id, name, email, username) VALUES ($1, $2, $3, $4) RETURNING id, name, email, username, currency, theme, created_at',
        [userId, name, email, username]
      );
      return res.json(insertResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar el perfil del usuario (nombre y nombre de usuario).
 */
export const updateProfile = async (req, res, next) => {
  const { name, username } = req.body;
  const userId = req.user.id;

  try {
    // 1. Si se intenta cambiar el username, validar que no esté en uso por otro usuario
    if (username) {
      const sanitizedUsername = username.trim().toLowerCase();
      
      // Validación básica de formato para username
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(sanitizedUsername)) {
        const err = new Error('El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números y guion bajo).');
        err.statusCode = 400;
        return next(err);
      }

      const checkUsername = await pool.query(
        'SELECT id FROM public.users WHERE LOWER(username) = LOWER($1) AND id != $2',
        [sanitizedUsername, userId]
      );

      if (checkUsername.rows.length > 0) {
        const err = new Error('El nombre de usuario ya está en uso por otra persona.');
        err.statusCode = 400;
        return next(err);
      }
    }

    // 2. Ejecutar la actualización en la base de datos
    const sql = `
      UPDATE public.users 
      SET name = COALESCE($1, name), 
          username = COALESCE(LOWER($2), username)
      WHERE id = $3
      RETURNING id, name, email, username, currency, theme, created_at
    `;
    const result = await pool.query(sql, [
      name ? name.trim() : null,
      username ? username.trim() : null,
      userId
    ]);

    if (result.rows.length === 0) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      return next(err);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
