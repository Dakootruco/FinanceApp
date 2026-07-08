import { Bell, Compass } from 'lucide-react';

export const SubscriptionsPage = () => {
  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bell className="text-indigo-400" size={24} />
          Suscripciones y Alertas
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Gestiona tus suscripciones y servicios recurrentes mensuales y anuales.
        </p>
      </div>

      <div className="bg-white border border-slate-100 p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[300px] animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm animate-pulse">
          <Compass size={32} />
        </div>
        <div>
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            En Desarrollo
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-3">¡Próximamente disponible!</h3>
          <p className="text-slate-400 text-xs font-semibold max-w-sm mt-1 mx-auto leading-relaxed">
            Estamos diseñando un rastreador de suscripciones (como Netflix, Spotify, etc.) con alertas push automáticas antes de cada fecha de cobro.
          </p>
        </div>
      </div>
    </div>
  );
};
export default SubscriptionsPage;
