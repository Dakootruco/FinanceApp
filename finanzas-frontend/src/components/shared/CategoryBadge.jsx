import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PlusCircle, 
  ShoppingBag, 
  Home, 
  Zap, 
  Heart, 
  Film, 
  BookOpen, 
  MinusCircle 
} from 'lucide-react';

const ICON_MAP = {
  briefcase: TrendingUp,
  'trending-up': TrendingUp,
  'credit-card': DollarSign,
  'plus-circle': PlusCircle,
  'shopping-bag': ShoppingBag,
  truck: TrendingDown,
  home: Home,
  zap: Zap,
  heart: Heart,
  film: Film,
  'book-open': BookOpen,
  'minus-circle': MinusCircle
};

export const CategoryBadge = ({ icon, color = '#cccccc', name, className = '' }) => {
  const IconComponent = ICON_MAP[icon] || MinusCircle;

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold select-none ${className}`}
      style={{ 
        backgroundColor: `${color}15`, // Transparencia al 8%
        color: color,
        border: `1px solid ${color}25`
      }}
    >
      <IconComponent size={13} className="shrink-0" />
      <span className="truncate max-w-[130px]">{name}</span>
    </div>
  );
};
