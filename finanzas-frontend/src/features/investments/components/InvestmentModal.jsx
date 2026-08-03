import { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../../components/ui/Input.jsx';

const VALID_CATEGORIES = ['Bolsa', 'Cripto', 'Bienes Raíces', 'Fondo Mutuo', 'Renta Fija', 'Otros'];

export const InvestmentModal = ({ isOpen, onClose, investmentToEdit = null }) => {
  const { addInvestment, updateInvestment } = useFinanceStore();

  const [form, setForm] = useState({
    name: '',
    category: 'Bolsa',
    amount_invested: '',
    change_percentage: '0'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (investmentToEdit) {
        setForm({
          name: investmentToEdit.name,
          category: investmentToEdit.category,
          amount_invested: investmentToEdit.amount_invested.toString(),
          change_percentage: investmentToEdit.change_percentage.toString()
        });
      } else {
        setForm({
          name: '',
          category: 'Bolsa',
          amount_invested: '',
          change_percentage: '0'
        });
      }
      setError('');
    }
  }, [isOpen, investmentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Debes ingresar un nombre para la inversión.');
      return;
    }

    if (!VALID_CATEGORIES.includes(form.category)) {
      setError('Selecciona una categoría válida.');
      return;
    }

    const amount = parseFloat(form.amount_invested);
    if (isNaN(amount) || amount < 0) {
      setError('El monto invertido debe ser un número válido mayor o igual a 0.');
      return;
    }

    const percentage = parseFloat(form.change_percentage);
    if (isNaN(percentage)) {
      setError('El porcentaje de rendimiento debe ser un número válido.');
      return;
    }

    let success;
    if (investmentToEdit) {
      success = await updateInvestment(investmentToEdit.id, {
        name: form.name.trim(),
        category: form.category,
        amount_invested: amount,
        change_percentage: percentage
      });
    } else {
      success = await addInvestment({
        name: form.name.trim(),
        category: form.category,
        amount_invested: amount,
        change_percentage: percentage
      });
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]">
          <h3 className="font-bold text-slate-800 dark:text-[#ffffff] flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500 dark:text-[#FB00FF]" />
            {investmentToEdit ? 'Editar Inversión' : 'Nueva Inversión'}
          </h3>
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

          {/* Nombre */}
          <FormGroup label="Nombre de la Inversión">
            <Input 
              type="text"
              placeholder="Ej. Acciones de Apple (AAPL)"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Categoría */}
          <FormGroup label="Categoría de Inversión">
            <Select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Capital Invertido */}
          <FormGroup label="Monto Capital Invertido ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 1500"
              value={form.amount_invested}
              onChange={(e) => setForm(prev => ({ ...prev, amount_invested: e.target.value }))}
              required
              min="0"
            />
          </FormGroup>

          {/* Rendimiento Inicial */}
          <FormGroup label="Porcentaje de Rendimiento Inicial (%)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 10.00 o -5.00"
              value={form.change_percentage}
              onChange={(e) => setForm(prev => ({ ...prev, change_percentage: e.target.value }))}
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
              {investmentToEdit ? 'Actualizar Inversión' : 'Agregar Inversión'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default InvestmentModal;
