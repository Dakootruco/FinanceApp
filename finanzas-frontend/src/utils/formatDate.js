/**
 * Formatea una cadena de fecha (ISO/SQL) al formato DD/MM/YYYY para evitar desfases de zona horaria.
 * Coincide con el diseño visual del prototipo.
 * 
 * @param {string|Date} dateString - Cadena de fecha
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Usar métodos UTC para evitar que el ajuste de zona horaria local altere la fecha original
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};
