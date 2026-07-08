import { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  ClipboardList, 
  Wallet, 
  Tags,
  CreditCard,
  Landmark,
  LineChart,
  Target,
  Bell,
  BarChart3,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { supabase } from '../../services/supabase.js';

export const Sidebar = () => {
  const { currentPage, setCurrentPage } = useFinanceStore();
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
    } catch (e) {
      console.error('Error saving sidebar state', e);
    }
  }, [isExpanded]);

  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Resumen' },
    { id: 'transactions', icon: ClipboardList, label: 'Movimientos' },
    { id: 'budgets', icon: Wallet, label: 'Presupuestos' },
    { id: 'categories', icon: Tags, label: 'Categorías' },
    { id: 'credit-cards', icon: CreditCard, label: 'Tarjetas' },
    { id: 'bank-accounts', icon: Landmark, label: 'Bancos' },
    { id: 'investments', icon: LineChart, label: 'Inversiones' },
    { id: 'savings-goals', icon: Target, label: 'Metas' },
    { id: 'subscriptions', icon: Bell, label: 'Suscripciones' },
    { id: 'reports', icon: BarChart3, label: 'Reportes' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <aside 
      className={`bg-[#121620] border-r border-white/5 flex flex-col items-center py-6 h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-[240px] px-4' : 'w-[80px] px-2'
      }`}
    >
      {/* Brand Logo & Toggle Header */}
      <div className={`w-full flex items-center mb-6 shrink-0 ${isExpanded ? 'justify-between px-2' : 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-soft-blue to-indigo-500 w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_20px_rgba(114,165,228,0.3)] shrink-0">
            <TrendingUp size={20} />
          </div>
          {isExpanded && (
            <span className="text-white font-black text-sm uppercase tracking-wider animate-fade-in-right whitespace-nowrap">
              Finanzas Pro
            </span>
          )}
        </div>
        
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            title="Colapsar menú"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand Button for Collapsed State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mb-6 w-11 h-11 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
          title="Expandir menú"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Navigation */}
      <nav 
        className="flex-grow w-full flex flex-col items-center gap-2 overflow-y-auto py-2 pr-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`rounded-xl flex items-center transition-all cursor-pointer relative group shrink-0 ${
                isExpanded 
                  ? 'w-full h-11 px-3.5 gap-3.5 justify-start' 
                  : 'w-12 h-12 justify-center'
              } ${
                isActive 
                  ? 'bg-white/10 text-soft-blue border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.03)]' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={isExpanded ? undefined : item.label}
            >
              <Icon size={18} className="shrink-0" />
              
              {isExpanded && (
                <span className="font-bold text-xs tracking-wide animate-fade-in-right whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
              
              {/* Tooltip (only when collapsed) */}
              {!isExpanded && (
                <span className="absolute left-[70px] bg-slate-900 border border-white/10 text-slate-200 text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="w-full mt-auto pt-4 border-t border-white/5 flex flex-col items-center shrink-0">
        <button
          onClick={() => supabase.auth.signOut()}
          className={`rounded-xl flex items-center transition-all cursor-pointer relative group shrink-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 ${
            isExpanded 
              ? 'w-full h-11 px-3.5 gap-3.5 justify-start' 
              : 'w-12 h-12 justify-center'
          }`}
          title={isExpanded ? undefined : 'Cerrar Sesión'}
        >
          <LogOut size={18} className="shrink-0" />
          
          {isExpanded && (
            <span className="font-bold text-xs tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              Cerrar Sesión
            </span>
          )}
          
          {/* Tooltip (only when collapsed) */}
          {!isExpanded && (
            <span className="absolute left-[70px] bg-slate-900 border border-white/10 text-slate-200 text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl z-50">
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
