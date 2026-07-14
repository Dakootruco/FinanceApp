import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Home, 
  Zap, 
  Heart, 
  Film, 
  BookOpen, 
  MinusCircle,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Fuel
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

const ICON_MAP = {
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  'credit-card': DollarSign,
  'plus-circle': TrendingUp,
  'shopping-bag': ShoppingBag,
  truck: TrendingDown,
  home: Home,
  zap: Zap,
  heart: Heart,
  film: Film,
  'book-open': BookOpen,
  'minus-circle': MinusCircle,
  fuel: Fuel
};

export const BudgetCard = ({ 
  id, 
  category_id, 
  name, 
  icon, 
  color, 
  spent = 0, 
  limit = null, 
  onEdit, 
  onDelete 
}) => {
  const IconComponent = ICON_MAP[icon] || MinusCircle;
  
  // Si no hay límite asignado en la base de datos
  if (limit === null) {
    return (
      <Card className="!bg-white border border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-5 flex flex-col justify-between h-[200px] transition-all hover:shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ 
              backgroundColor: `${color}10`, 
              color: color 
            }}
          >
            <IconComponent size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{name}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sin Presupuesto</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          Configura un límite de gastos mensual para monitorear consumos en esta categoría.
        </p>

        <button
          onClick={onEdit}
          className="w-full py-2 px-4 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          + Establecer Límite
        </button>
      </Card>
    );
  }

  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const remaining = limit - spent;
  const isOverBudget = spent > limit;

  return (
    <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between h-[200px]">
      <div className="flex flex-col gap-3.5">
        {/* Encabezado de la categoría */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ 
                backgroundColor: `${color}15`, 
                color: color 
              }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">{name}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Límite mensual</span>
            </div>
          </div>
          <span className="text-xs font-black font-sans text-slate-800">
            {formatCurrency(limit)}
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="flex flex-col gap-1.5">
          <Progress value={spent} max={limit} />
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>{percentage}% consumido</span>
            <span>Gastado: {formatCurrency(spent)}</span>
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta con alertas y acciones */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50 justify-between">
        {/* Estado semántico */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
          isOverBudget 
            ? 'bg-rose-50 text-rose-600' 
            : remaining <= limit * 0.2
            ? 'bg-amber-50 text-amber-600'
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isOverBudget ? (
            <>
              <AlertTriangle size={12} className="shrink-0" />
              <span>Excedido</span>
            </>
          ) : remaining <= limit * 0.2 ? (
            <>
              <AlertTriangle size={12} className="shrink-0" />
              <span>Crítico</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="shrink-0" />
              <span>Disponible</span>
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="py-1.5 px-3 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-850 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all cursor-pointer"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="py-1.5 px-2.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            title="Eliminar límite"
          >
            Resetear
          </button>
        </div>
      </div>
    </Card>
  );
};
export default BudgetCard;
