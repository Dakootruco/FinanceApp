/**
 * Formatea un número como divisa en formato USD/Global con 2 decimales ($45,250.00).
 * Coincide con el diseño visual del prototipo.
 * 
 * @param {number|string} value - El monto numérico a formatear
 * @returns {string} - Monto formateado
 */
export const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  const currency = localStorage.getItem('user-currency') || 'USD';
  const locale = {
    USD: 'en-US',
    EUR: 'es-ES',
    MXN: 'es-MX',
    DOP: 'es-DO'
  }[currency] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};
