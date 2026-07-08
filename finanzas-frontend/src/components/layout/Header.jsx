import { Search, Bell, Plus, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Button } from '../ui/Button.jsx';

export const Header = () => {
  const {
    apiOnline,
    checkConnectionAndLoad,
    setImportModalOpen,
    userName
  } = useFinanceStore();

  return (
    <header className="h-[110px] border-b border-slate-100  bg-[#f4f5f7]/80 backdrop-blur-md px-8 md:px-10 flex items-center justify-between sticky top-0 z-40">

      {/* Saludo */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          ¡Hola, {userName}!
        </h2>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-6">

        {/* Buscador */}
        <div className="relative hidden md:block w-[280px]">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-slate-200/60 border border-slate-200/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 text-sm outline-none focus:border-slate-300 focus:bg-white transition-all placeholder-slate-400"
          />
        </div>

        {/* Estatus API */}
        <div className="flex items-center gap-2 bg-slate-200/65 px-3.5 py-1.5 rounded-full border border-slate-200/10 text-xs">
          <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></span>
          <span className="text-slate-600 font-bold">{apiOnline ? 'Local' : 'Offline'}</span>
          {!apiOnline && (
            <button
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              onClick={checkConnectionAndLoad}
              title="Reintentar conexión"
            >
              <RefreshCw size={12} className="animate-spin" />
            </button>
          )}
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
        <button className="text-slate-500 hover:text-slate-800 transition-colors relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#f4f5f7]"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/50 flex items-center justify-center font-bold text-slate-800 text-sm cursor-pointer shadow-sm">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>

      </div>
    </header>
  );
};
