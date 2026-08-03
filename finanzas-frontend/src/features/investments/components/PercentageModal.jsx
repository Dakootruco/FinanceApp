import { useState, useEffect } from 'react';
import { X, Percent } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../../components/ui/Input.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export const PercentageModal = ({ isOpen, onClose, investment = null }) => {
  const { adjustInvestmentPercentage } = useFinanceStore();

  const [percentage, setPercentage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && investment) {
      setPercentage(investment.change_percentage.toString());
      setError('');
    }
  }, [isOpen, investment]);

  if (!isOpen || !investment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericPercentage = parseFloat(percentage);
    if (isNaN(numericPercentage)) {
      setError('El porcentaje de rendimiento debe ser un número válido.');
      return;
    }

    const success = await adjustInvestmentPercentage(investment.id, numericPercentage);
    if (success) {
      onClose();
    }
  };

  // Calcular valor estimado en tiempo real para previsualización
  const numericPercentage = parseFloat(percentage);
  const investedAmount = parseFloat(investment.amount_invested);
  const previewValue = !isNaN(numericPercentage)
    ? investedAmount * (1 + numericPercentage / 100)
    : investedAmount;
  const previewReturn = !isNaN(numericPercentage)
    ? investedAmount * (numericPercentage / 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-[#ffffff] flex items-center gap-2">
              <Percent size={18} className="text-indigo-500 dark:text-[#FB00FF]" />
              Ajustar Rendimiento (%)
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-[#94a3b8] font-semibold mt-0.5">{investment.name}</span>
          </div>
          <button 
            className="text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors p-1 hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] rounded-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Previsualización en Tiempo Real */}
          <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider text-[10px]">Capital Invertido</span>
              <span className="font-extrabold text-slate-800 dark:text-[#ffffff]">{formatCurrency(investedAmount)}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-[rgba(255,255,255,0.07)]/60 dark:border-[rgba(255,255,255,0.07)] my-0.5"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider text-[10px]">Nuevo Valor Estimado</span>
              <span className="font-black text-indigo-600 dark:text-[#FB00FF] text-sm">{formatCurrency(previewValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider text-[10px]">Retorno Estimado</span>
              <span className={`font-extrabold ${previewReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {previewReturn >= 0 ? '+' : ''}{formatCurrency(previewReturn)} ({isNaN(numericPercentage) ? '0' : numericPercentage}%)
              </span>
            </div>
          </div>

          {/* Porcentaje de Rendimiento */}
          <FormGroup label="Nuevo Rendimiento Porcentual (%)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 10.5 o -3.2"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              required
            />
          </FormGroup>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button 
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              Actualizar Rendimiento
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default PercentageModal;
