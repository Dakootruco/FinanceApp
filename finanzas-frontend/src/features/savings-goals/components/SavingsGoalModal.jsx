import { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../../components/ui/Input.jsx';

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Índigo' },
  { value: '#72a5e4', label: 'Azul Cielo' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#06b6d4', label: 'Cian' },
  { value: '#ec4899', label: 'Rosa' }
];

export const SavingsGoalModal = ({ isOpen, onClose, goalToEdit = null }) => {
  const { addSavingsGoal, updateSavingsGoal } = useFinanceStore();

  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    color_theme: '#6366f1'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setForm({
          name: goalToEdit.name,
          target_amount: goalToEdit.target_amount.toString(),
          current_amount: goalToEdit.current_amount.toString(),
          color_theme: goalToEdit.color_theme || '#6366f1'
        });
      } else {
        setForm({
          name: '',
          target_amount: '',
          current_amount: '0',
          color_theme: '#6366f1'
        });
      }
      setError('');
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Debes ingresar un nombre para el plan de ahorro.');
      return;
    }

    const target = parseFloat(form.target_amount);
    if (isNaN(target) || target <= 0) {
      setError('La meta de ahorro debe ser un número mayor a 0.');
      return;
    }

    const current = parseFloat(form.current_amount);
    if (isNaN(current) || current < 0) {
      setError('El monto ahorrado actual debe ser un número mayor o igual a 0.');
      return;
    }

    let success;
    if (goalToEdit) {
      success = await updateSavingsGoal(goalToEdit.id, {
        name: form.name.trim(),
        target_amount: target,
        current_amount: current,
        color_theme: form.color_theme
      });
    } else {
      success = await addSavingsGoal({
        name: form.name.trim(),
        target_amount: target,
        current_amount: current,
        color_theme: form.color_theme
      });
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            {goalToEdit ? 'Editar Plan de Ahorro' : 'Nuevo Plan de Ahorro'}
          </h3>
          <button 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
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
          <FormGroup label="Nombre del Plan">
            <Input 
              type="text"
              placeholder="Ej. Fondo de Emergencia"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Meta de Ahorro */}
          <FormGroup label="Meta de Ahorro ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 10000"
              value={form.target_amount}
              onChange={(e) => setForm(prev => ({ ...prev, target_amount: e.target.value }))}
              required
              min="0.01"
            />
          </FormGroup>

          {/* Monto Ahorrado Actual */}
          <FormGroup label="Monto Ahorrado Actual ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 2500"
              value={form.current_amount}
              onChange={(e) => setForm(prev => ({ ...prev, current_amount: e.target.value }))}
              min="0"
            />
          </FormGroup>

          {/* Color del Plan */}
          <FormGroup label="Color del Plan">
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, color_theme: color.value }))}
                  className={`w-8 h-8 rounded-xl transition-all cursor-pointer border-2 hover:scale-110 ${
                    form.color_theme === color.value 
                      ? 'border-slate-800 scale-110 shadow-md' 
                      : 'border-transparent shadow-sm'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
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
              {goalToEdit ? 'Actualizar Plan' : 'Crear Plan'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default SavingsGoalModal;
