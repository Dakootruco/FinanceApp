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
  LogOut,
  X
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { supabase } from '../../services/supabase.js';
import logoImg from '../../assets/viatigoapplogo.png';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
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
    <>
      {/* Backdrop de fondo oscuro para móvil */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`bg-[#121620] border-r border-white/5 flex flex-col items-center py-6 h-screen transition-all duration-300 ease-in-out z-50
          fixed inset-y-0 left-0 md:translate-x-0 md:sticky top-0 shrink-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'w-[240px] px-4' : 'w-[240px] px-4 md:w-[80px] md:px-2'}
        `}
      >
        {/* Brand Logo & Toggle Header */}
        <div className="w-full flex items-center mb-6 shrink-0 justify-between px-4 md:justify-center md:px-0 relative">
          <div className="flex flex-col items-center gap-1.5 md:mx-auto">
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#000000]">
              <img
                src={logoImg}
                alt="Logo"
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.42)' }}
              />
            </div>
            <span className={`text-[#ffffff] font-black text-lg tracking-wide animate-fade-in whitespace-nowrap ${isExpanded ? 'block' : 'block md:hidden'}`}>
              Viati<span className="text-[#FB00FF]">Go</span>
            </span>
          </div>

          {/* Botón de cerrar en móvil */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>

          {/* Botón de colapsar en desktop */}
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="hidden md:block text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              title="Colapsar menú"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Botón de expandir en desktop (solo cuando está colapsado) */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="hidden md:flex mb-6 w-11 h-11 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white items-center justify-center cursor-pointer transition-all shrink-0"
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
                className={`rounded-xl flex items-center transition-all cursor-pointer relative group shrink-0
                  w-full h-11 px-3.5 gap-3.5 justify-start
                  ${isExpanded ? '' : 'md:w-12 md:h-12 md:justify-center md:px-0'}
                  ${isActive
                    ? 'bg-white/10 text-soft-blue border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}
                title={isExpanded ? undefined : item.label}
              >
                <Icon size={18} className="shrink-0" />

                <span className={`font-bold text-xs tracking-wide animate-fade-in-right whitespace-nowrap overflow-hidden text-ellipsis block ${isExpanded ? 'md:block' : 'md:hidden'}`}>
                  {item.label}
                </span>

                {/* Tooltip (solo cuando está colapsado en desktop) */}
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
            className={`rounded-xl flex items-center transition-all cursor-pointer relative group shrink-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10
              w-full h-11 px-3.5 gap-3.5 justify-start
              ${isExpanded ? '' : 'md:w-12 md:h-12 md:justify-center md:px-0'}
            `}
            title={isExpanded ? undefined : 'Cerrar Sesión'}
          >
            <LogOut size={18} className="shrink-0" />

            <span className={`font-bold text-xs tracking-wide whitespace-nowrap overflow-hidden text-ellipsis block ${isExpanded ? 'md:block' : 'md:hidden'}`}>
              Cerrar Sesión
            </span>

            {/* Tooltip (solo cuando está colapsado en desktop) */}
            {!isExpanded && (
              <span className="absolute left-[70px] bg-slate-900 border border-white/10 text-slate-200 text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
