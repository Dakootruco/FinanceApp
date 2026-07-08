
/**
 * Componente de barra de progreso premium.
 * Cambia de color automáticamente (Verde -> Amarillo -> Rojo) según el porcentaje consumido,
 * a menos que se fuerce un color específico.
 * 
 * @param {number} value - Valor actual consumido (e.g. 4500)
 * @param {number} max - Límite de presupuesto (e.g. 10000)
 * @param {string} colorClass - Color opcional de Tailwind (e.g. 'bg-indigo-500')
 */
export const Progress = ({ value = 0, max = 100, colorClass = '', className = '' }) => {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  
  // Calcular color dinámico si no se especifica uno fijo
  const getDynamicColor = () => {
    if (colorClass) return colorClass;
    if (percentage <= 70) return 'bg-emerald-500';
    if (percentage <= 90) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Track */}
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        {/* Progress Bar */}
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${getDynamicColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
