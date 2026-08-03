import { useState, useEffect } from 'react';
import { 
  X, 
  Tags,
  Briefcase, 
  TrendingUp, 
  CreditCard, 
  PlusCircle, 
  ShoppingBag, 
  Truck, 
  Home, 
  Zap, 
  Heart, 
  Film, 
  BookOpen, 
  MinusCircle,
  Fuel
} from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../../components/ui/Input.jsx';

const ICON_OPTIONS = [
  { name: 'briefcase', icon: Briefcase, label: 'Negocio / Trabajo' },
  { name: 'trending-up', icon: TrendingUp, label: 'Inversión' },
  { name: 'credit-card', icon: CreditCard, label: 'Tarjeta / Banco' },
  { name: 'plus-circle', icon: PlusCircle, label: 'Otros Ingresos' },
  { name: 'shopping-bag', icon: ShoppingBag, label: 'Bolsa / Compras' },
  { name: 'truck', icon: Truck, label: 'Transporte' },
  { name: 'fuel', icon: Fuel, label: 'Combustible' },
  { name: 'home', icon: Home, label: 'Hogar / Alquiler' },
  { name: 'zap', icon: Zap, label: 'Servicios / Energía' },
  { name: 'heart', icon: Heart, label: 'Salud' },
  { name: 'film', icon: Film, label: 'Ocio / Entretenimiento' },
  { name: 'book-open', icon: BookOpen, label: 'Educación' },
  { name: 'minus-circle', icon: MinusCircle, label: 'Otros Gastos' },
];

const PRESET_COLORS = [
  '#EF4444', // Rojo
  '#F59E0B', // Naranja/Ambar
  '#10B981', // Esmeralda/Verde
  '#06B6D4', // Cyan
  '#3B82F6', // Azul
  '#6366F1', // Indigo
  '#8B5CF6', // Violeta/Morado
  '#EC4899', // Rosa
  '#14B8A6', // Teal
  '#6B7280', // Gris
];

export const CategoryModal = ({ isOpen, onClose, categoryToEdit = null }) => {
  const { addCategory, updateCategory } = useFinanceStore();

  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: 'minus-circle',
    color: '#6366f1'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setForm({
          name: categoryToEdit.name,
          type: categoryToEdit.type,
          icon: categoryToEdit.icon || 'minus-circle',
          color: categoryToEdit.color || '#6366f1'
        });
      } else {
        setForm({
          name: '',
          type: 'expense',
          icon: 'minus-circle',
          color: '#6366f1'
        });
      }
      setError('');
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    let success;
    if (categoryToEdit) {
      success = await updateCategory(categoryToEdit.id, {
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        color: form.color
      });
    } else {
      success = await addCategory({
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        color: form.color
      });
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Diálogo */}
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]">
          <h3 className="font-bold text-slate-800 dark:text-[#ffffff] flex items-center gap-2">
            <Tags size={18} className="text-indigo-500 dark:text-[#FB00FF]" />
            {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button 
            className="text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors p-1 hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] rounded-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Nombre */}
          <FormGroup label="Nombre de Categoría">
            <Input 
              placeholder="Ej. Supermercado, Salario, Ocio"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Tipo (Solo disponible al crear) */}
          <FormGroup label="Tipo de Categoría">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#1C1D2A] p-1 rounded-xl border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50">
              <button 
                type="button" 
                disabled={!!categoryToEdit}
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  form.type === 'expense' 
                    ? 'bg-white dark:bg-[#12131A] text-rose-650 shadow-sm border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/20' 
                    : 'text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:text-[#ffffff] dark:hover:text-white dark:text-[#ffffff] disabled:opacity-50'
                }`}
                onClick={() => setForm(prev => ({ ...prev, type: 'expense' }))}
              >
                Gasto
              </button>
              <button 
                type="button" 
                disabled={!!categoryToEdit}
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  form.type === 'income' 
                    ? 'bg-white dark:bg-[#12131A] text-emerald-650 shadow-sm border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/20' 
                    : 'text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:text-[#ffffff] dark:hover:text-white dark:text-[#ffffff] disabled:opacity-50'
                }`}
                onClick={() => setForm(prev => ({ ...prev, type: 'income' }))}
              >
                Ingreso
              </button>
            </div>
            {categoryToEdit && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-[#94a3b8] mt-1">
                El tipo no se puede cambiar en edición para mantener consistencia histórica.
              </span>
            )}
          </FormGroup>

          {/* Selector de Iconos */}
          <FormGroup label="Icono Representativo">
            <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-[#1C1D2A] p-3 rounded-xl border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = form.icon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    title={opt.label}
                    onClick={() => setForm(prev => ({ ...prev, icon: opt.name }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 dark:bg-[#FB00FF] text-white shadow-md scale-105' 
                        : 'bg-white dark:bg-[#12131A] text-slate-600 dark:text-[#94a3b8] hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] hover:text-slate-850 border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/40'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </div>
          </FormGroup>

          {/* Selector de Colores */}
          <FormGroup label="Color Temático">
            <div className="flex flex-wrap gap-2.5 bg-slate-50 dark:bg-[#1C1D2A] p-3 rounded-xl border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((col) => {
                  const isSelected = form.color.toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, color: col }))}
                      className="w-7 h-7 rounded-full transition-all cursor-pointer hover:scale-110 relative flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: col }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white dark:bg-[#12131A] shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Selector personalizado */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-[rgba(255,255,255,0.07)] pl-3">
                <input 
                  type="color" 
                  className="w-8 h-8 border border-slate-200 dark:border-[rgba(255,255,255,0.07)] rounded-lg cursor-pointer bg-white dark:bg-[#12131A] p-1"
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  title="Color personalizado"
                />
              </div>
            </div>
          </FormGroup>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 mt-3">
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
              {categoryToEdit ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
export default CategoryModal;
