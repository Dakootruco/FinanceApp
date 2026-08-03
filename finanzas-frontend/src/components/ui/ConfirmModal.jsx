import React from 'react';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './Button.jsx';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' | 'primary'
}) => {
  if (!isOpen) return null;

  const Icon = variant === 'danger' ? AlertTriangle : HelpCircle;
  const iconColorClass = variant === 'danger' ? 'text-rose-500 bg-rose-50 border-rose-100' : 'text-indigo-500 dark:text-[#FB00FF] bg-indigo-50 dark:bg-[#FB00FF]/10 border-indigo-100 dark:border-[#FB00FF]/20';
  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Cabecera */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            className="text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors p-1 hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] rounded-lg cursor-pointer outline-none"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido del Cuerpo */}
        <div className="px-6 pb-6 flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconColorClass}`}>
            <Icon size={22} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-base leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold leading-relaxed">
              {description}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2.5 w-full mt-2">
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
              className="flex-1 !py-2.5 !text-xs !rounded-xl"
            >
              {cancelText}
            </Button>
            <Button 
              type="button" 
              variant={confirmButtonVariant}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 !py-2.5 !text-xs !rounded-xl"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
