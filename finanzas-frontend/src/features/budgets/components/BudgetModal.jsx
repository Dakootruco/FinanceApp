import { useState, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../../components/ui/Input.jsx';

export const BudgetModal = ({ isOpen, onClose, budgetToEdit = null }) => {
  const { categories, budgets, saveBudget } = useFinanceStore();

  const [form, setForm] = useState({
    category_id: '',
    limit_amount: ''
  });

  const [error, setError] = useState('');

  // Cargar datos en el formulario al abrir en modo edición
  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setForm({
          category_id: budgetToEdit.category_id.toString(),
          limit_amount: budgetToEdit.limit_amount.toString()
        });
      } else {
        // En modo creación, preseleccionar la primera categoría de gasto disponible
        const expenseCats = categories.filter(c => c.type === 'expense');
        // Filtrar categorías que aún no tienen presupuesto para que la experiencia sea más limpia,
        // aunque si todas tienen, permitimos re-establecer.
        const activeBudgetCategoryIds = budgets.map(b => b.category_id);
        const availableCats = expenseCats.filter(c => !activeBudgetCategoryIds.includes(c.id));
        
        const defaultCategory = availableCats.length > 0 
          ? availableCats[0] 
          : expenseCats.length > 0 
          ? expenseCats[0] 
          : null;

        setForm({
          category_id: defaultCategory ? defaultCategory.id.toString() : '',
          limit_amount: ''
        });
      }
      setError('');
    }
  }, [isOpen, budgetToEdit, categories, budgets]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category_id) {
      setError('Debes seleccionar una categoría.');
      return;
    }

    const limit = parseFloat(form.limit_amount);
    if (isNaN(limit) || limit < 0) {
      setError('El límite debe ser un número válido mayor o igual a 0.');
      return;
    }

    const success = await saveBudget({
      category_id: parseInt(form.category_id, 10),
      limit_amount: limit
    });

    if (success) {
      onClose();
    }
  };

  // Filtrar categorías para mostrar solo las de gasto (expense)
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      {/* Diálogo */}
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={18} className="text-indigo-500" />
            {budgetToEdit ? 'Modificar Presupuesto' : 'Establecer Presupuesto'}
          </h3>
          <button 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Categoría */}
          <FormGroup label="Categoría de Gasto">
            <Select
              value={form.category_id}
              onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
              required
              disabled={!!budgetToEdit} // Desactivado si estamos editando
              className={budgetToEdit ? 'opacity-70 bg-slate-100 cursor-not-allowed' : ''}
            >
              <option value="" disabled>Selecciona una categoría</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {budgetToEdit && (
              <span className="text-[10px] font-semibold text-slate-400 mt-1">
                La categoría no se puede cambiar en edición. Para otra categoría, crea un nuevo presupuesto.
              </span>
            )}
          </FormGroup>

          {/* Límite de Gasto */}
          <FormGroup label="Límite Mensual ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 5000"
              value={form.limit_amount}
              onChange={(e) => setForm(prev => ({ ...prev, limit_amount: e.target.value }))}
              required
              min="0"
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
              Guardar Límite
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
export default BudgetModal;
