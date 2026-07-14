import { useState } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  Edit3,
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
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';

const ICON_MAP = {
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  'credit-card': CreditCard,
  'plus-circle': PlusCircle,
  'shopping-bag': ShoppingBag,
  truck: Truck,
  home: Home,
  zap: Zap,
  heart: Heart,
  film: Film,
  'book-open': BookOpen,
  'minus-circle': MinusCircle,
  fuel: Fuel
};

export const CategoriesPage = () => {
  const { categories, deleteCategory } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEdit = (cat) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (cat) => {
    setDeleteTarget(cat);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Filtrar
  const expenseCats = categories.filter(c => c.type === 'expense');
  const incomeCats = categories.filter(c => c.type === 'income');

  const renderCategoryCard = (cat) => {
    const IconComp = ICON_MAP[cat.icon] || MinusCircle;

    return (
      <div
        key={cat.id}
        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/60 transition-all text-slate-800"
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${cat.color}15`,
              color: cat.color
            }}
          >
            <IconComp size={18} />
          </div>
          <span className="font-bold text-sm text-slate-800">{cat.name}</span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => handleEdit(cat)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-all cursor-pointer inline-flex items-center justify-center"
            title="Editar categoría"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => handleDelete(cat)}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center justify-center"
            title="Eliminar categoría"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tags className="text-indigo-400" size={24} />
            Categorías del Sistema
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Administra y personaliza tus categorías para clasificar adecuadamente tus ingresos y gastos.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto flex justify-center">
          <Plus size={16} />
          Nueva Categoría
        </Button>
      </div>

      {/* Contenedores de Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Categorías de Gastos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm h-full flex flex-col">
          <CardHeader className="!border-none pb-0">
            <CardTitle className="text-rose-600">Categorías de Gasto</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex-grow">
            {expenseCats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No hay categorías de gastos registradas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expenseCats.map(renderCategoryCard)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorías de Ingresos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm h-full flex flex-col">
          <CardHeader className="!border-none pb-0">
            <CardTitle className="text-emerald-600">Categorías de Ingreso</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex-grow">
            {incomeCats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No hay categorías de ingresos registradas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incomeCats.map(renderCategoryCard)}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Modal CRUD Categorías */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar categoría?"
        description={`¿Estás seguro de que deseas eliminar la categoría "${deleteTarget?.name}"? Las transacciones asociadas se quedarán "Sin Categoría" y sus presupuestos se eliminarán.`}
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};
export default CategoriesPage;
