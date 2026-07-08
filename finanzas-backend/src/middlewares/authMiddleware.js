import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Middleware para requerir autenticación mediante JWT de Supabase.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticación o el formato no es válido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validar el token obteniendo el usuario directamente de Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Inyectar el objeto de usuario en la solicitud
    req.user = user;
    next();
  } catch (err) {
    console.error('Error en requireAuth middleware:', err);
    return res.status(401).json({ error: 'Error al validar la identidad del usuario' });
  }
};
