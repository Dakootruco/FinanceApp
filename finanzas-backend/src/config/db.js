import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

// Forzar a Node.js a preferir IPv4 sobre IPv6 para evitar errores ENETUNREACH en Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

const { Pool } = pg;

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Si hay una URL de conexión completa (útil para servicios en la nube como Render/Neon/Supabase)
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  // Habilitar SSL si no es una conexión local
  if (!process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

// Capturar errores en clientes inactivos para evitar que el proceso Node.js muera
pool.on('error', (err) => {
  console.error('Error inesperado en un cliente inactivo de PostgreSQL:', err.message);
});

/**
 * Método helper para realizar consultas sencillas.
 * Utiliza pool.query directamente, lo que adquiere y libera el cliente de forma automática.
 * 
 * @param {string} text - Consulta SQL parametrizada (e.g., 'SELECT * FROM users WHERE id = $1')
 * @param {Array} params - Valores de los parámetros para evitar SQL Injection
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params) => {
  return pool.query(text, params);
};

// Exportamos el pool para poder obtener clientes específicos si necesitamos Transacciones SQL (pool.connect())
export default pool;
