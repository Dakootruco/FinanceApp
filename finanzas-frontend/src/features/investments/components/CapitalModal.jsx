import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../../components/ui/Input.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export const CapitalModal = ({ isOpen, onClose, investment = null }) => {
  const { adjustInvestmentAmount } = useFinanceStore();

  const [type, setType] = useState('add'); // 'add' (inyectar) o 'withdraw' (retirar)
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType('add');
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !investment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser un número válido mayor a 0.');
      return;
    }

    // Si es retiro, enviar valor negativo
    const adjustment = type === 'add' ? numericAmount : -numericAmount;

    // Validación local del capital disponible
    const currentCapital = parseFloat(investment.amount_invested);
    if (type === 'withdraw' && numericAmount > currentCapital) {
      setError(`No puedes retirar más capital del que tienes invertido. Capital actual: ${formatCurrency(currentCapital)}`);
      return;
    }

    const success = await adjustInvestmentAmount(investment.id, adjustment);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-[#ffffff] flex items-center gap-2">
              <DollarSign size={18} className="text-indigo-500 dark:text-[#FB00FF]" />
              Ajustar Capital Invertido
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

          <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl p-4 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider block text-[10px]">Capital Invertido Actual</span>
              <span className="text-base font-black text-slate-800 dark:text-[#ffffff] mt-0.5 block">{formatCurrency(investment.amount_invested)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider block text-[10px]">Valor de Mercado</span>
              <span className="text-base font-black text-slate-800 dark:text-[#ffffff] mt-0.5 block">{formatCurrency(investment.current_value)}</span>
            </div>
          </div>

          {/* Tipo de Ajuste */}
          <FormGroup label="Acción de Capital">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="add">Inyectar Capital (+)</option>
              <option value="withdraw">Retirar Capital (-)</option>
            </Select>
          </FormGroup>

          {/* Monto del Ajuste */}
          <FormGroup label="Monto a Ajustar ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
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
              Ajustar Capital
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default CapitalModal;
