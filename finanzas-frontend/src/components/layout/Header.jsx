import { Search, Bell, Plus, RefreshCw, Menu } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Button } from '../ui/Button.jsx';

export const Header = ({ onOpenMobile }) => {
  const {
    setImportModalOpen,
    userName,
    setCurrentPage
  } = useFinanceStore();

  return (
    <header className="h-[110px] shrink-0 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-[#f4f5f7]/80 dark:bg-[#000000]/80 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30">

      {/* Saludo y Botón Menú Móvil */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden text-slate-700 dark:text-[#ffffff] hover:text-slate-900 dark:text-[#ffffff] dark:hover:text-white dark:text-[#ffffff] p-2 hover:bg-slate-200 dark:bg-[#1C1D2A] dark:hover:bg-white dark:bg-[#12131A]/5 dark:bg-[#1C1D2A] rounded-xl cursor-pointer transition-colors shrink-0"
          title="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <div
          onClick={() => setCurrentPage('profile')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title="Ver Perfil"
        >
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#ffffff] tracking-tight">
            ¡Hola, {userName}!
          </h2>
        </div>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-6">

        {/* Buscador */}
        <div className="relative hidden md:block w-[280px]">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-[#94a3b8]">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-slate-200 dark:bg-[#1C1D2A]/60 dark:bg-[#1C1D2A] border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-[#ffffff] text-sm outline-none focus:border-slate-300 dark:border-[rgba(255,255,255,0.07)] focus:bg-white dark:bg-[#12131A] transition-all placeholder-slate-400"
          />
        </div>

        {/* Botón Añadir Movimiento */}
        <Button
          variant="primary"
          onClick={() => setImportModalOpen(true)}
          className="!py-2 !px-4 !rounded-xl"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo Movimiento</span>
        </Button>

        {/* Icono Notificaciones */}
        <button className="text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:text-[#ffffff] dark:hover:text-white dark:text-[#ffffff] transition-colors relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 dark:bg-[#FB00FF] rounded-full border-2 border-[#f4f5f7] dark:border-[#000000]"></span>
        </button>

        {/* Avatar */}
        <div
          onClick={() => setCurrentPage('profile')}
          className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#1C1D2A] border border-slate-300/50 dark:border-[rgba(255,255,255,0.07)] flex items-center justify-center font-bold text-slate-800 dark:text-[#ffffff] text-sm cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
          title="Ver Perfil"
        >
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

      </div>
    </header>
  );
};
