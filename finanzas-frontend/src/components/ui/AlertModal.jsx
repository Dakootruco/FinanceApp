import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Button } from './Button.jsx';

export const AlertModal = () => {
  const { alertOpen, alertConfig, hideAlert } = useFinanceStore();

  if (!alertOpen) return null;

  const { title, description, variant = 'error' } = alertConfig;

  let Icon = AlertTriangle;
  let iconColorClass = 'text-rose-500 bg-rose-50 border-rose-100';
  let buttonVariant = 'danger';

  if (variant === 'success') {
    Icon = CheckCircle;
    iconColorClass = 'text-emerald-500 bg-emerald-50 border-emerald-100';
    buttonVariant = 'primary';
  } else if (variant === 'info') {
    Icon = Info;
    iconColorClass = 'text-blue-500 bg-blue-50 border-blue-100';
    buttonVariant = 'primary';
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Cabecera */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer outline-none"
            onClick={hideAlert}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido del Cuerpo */}
        <div className="px-6 pb-6 flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconColorClass}`}>
            <Icon size={22} />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed break-words max-h-[150px] overflow-y-auto pr-1">
              {description}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="w-full mt-2">
            <Button 
              type="button" 
              variant={buttonVariant}
              onClick={hideAlert}
              className="w-full !py-2.5 !text-xs !rounded-xl font-bold"
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
