import { useState } from 'react';
import { Wallet, ShieldAlert, Plus } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { BudgetCard } from './components/BudgetCard.jsx';
import { BudgetModal } from './components/BudgetModal.jsx';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Progress } from '../../components/ui/Progress.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';

export const BudgetsPage = () => {
  const { transactions, categories, budgets, deleteBudget } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Obtener transacciones de gastos del mes en curso
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  const expenseTransactions = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    if (!t.date) return false;
    const parts = t.date.substring(0, 10).split('-');
    if (parts.length < 2) return false;
    const tYear = parseInt(parts[0], 10);
    const tMonth = parseInt(parts[1], 10) - 1;
    return tYear === currentYear && tMonth === currentMonth;
  });

  // Construir los presupuestos consolidados
  const budgetsData = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      // Buscar si esta categoría tiene un presupuesto en el estado de Zustand (base de datos)
      const dbBudget = budgets.find(b => b.category_id === c.id);
      const limit = dbBudget ? parseFloat(dbBudget.limit_amount) : null;

      const spent = expenseTransactions
        .filter(t => t.category_id === c.id)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        id: dbBudget ? dbBudget.id : null,
        category_id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        spent,
        limit
      };
    });

  // Calcular métricas globales de presupuestos activos
  const activeBudgets = budgetsData.filter(b => b.limit !== null);
  const totalLimit = activeBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
  const globalPercentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

  const exceededBudgetsCount = activeBudgets.filter(b => b.spent > b.limit).length;

  const handleEdit = (b) => {
    setBudgetToEdit({
      id: b.id,
      category_id: b.category_id,
      limit_amount: b.limit
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setBudgetToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (budgetId, categoryName) => {
    setDeleteTargetId(budgetId);
    setDeleteTargetName(categoryName || 'esta categoría');
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteBudget(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#ffffff] tracking-tight flex items-center gap-2.5">
            <Wallet className="text-indigo-400 dark:text-[#FB00FF]" size={24} />
            Límites de Presupuesto
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold mt-1">
            Controla tus consumos mensuales por categoría y evita exceder tus límites financieros.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto flex justify-center">
          <Plus size={16} />
          Establecer Presupuesto
        </Button>
      </div>

      {/* Resumen Global de Presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* KPI: Progreso Consolidado */}
        <Card className="md:col-span-2 !bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm">
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-slate-500 dark:text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
              <span>Consumo Global de Presupuestos</span>
              <span className="text-xs font-black text-slate-800 dark:text-[#ffffff]">{globalPercentage}%</span>
            </div>

            <Progress value={totalSpent} max={totalLimit} colorClass="bg-indigo-550" />

            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-[#94a3b8]">
              <span>Gastado total presupuestado: {formatCurrency(totalSpent)}</span>
              <span>Límite total: {formatCurrency(totalLimit)}</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Alertas de Desvíos */}
        <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm">
          <CardContent className="flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-center text-slate-500 dark:text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
              <span>Estado de Presupuestos</span>
              <ShieldAlert className={exceededBudgetsCount > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-500 dark:text-[#94a3b8]'} size={18} />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-[#ffffff]">
                {exceededBudgetsCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#94a3b8]">
                {exceededBudgetsCount === 1
                  ? 'Presupuesto excedido este mes'
                  : 'Presupuestos excedidos este mes'
                }
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Grid de Presupuestos por Categoría */}
      {activeBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#94a3b8] gap-3.5 bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm animate-fade-in">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-[#FB00FF]/10 text-indigo-500 dark:text-[#FB00FF] rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-[#FB00FF]/20 shadow-sm">
            <Wallet size={28} />
          </div>
          <div className="text-center flex flex-col gap-0.5 mt-1">
            <p className="font-bold text-sm text-slate-800 dark:text-[#ffffff]">No hay presupuestos configurados</p>
            <span className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold">Configura límites mensuales para monitorear tus consumos.</span>
          </div>
          <Button variant="primary" onClick={handleCreate} className="mt-2">
            <Plus size={16} />
            Establecer Presupuesto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBudgets.map(b => (
            <BudgetCard
              key={b.category_id}
              id={b.id}
              category_id={b.category_id}
              name={b.name}
              icon={b.icon}
              color={b.color}
              spent={b.spent}
              limit={b.limit}
              onEdit={() => handleEdit(b)}
              onDelete={() => handleDelete(b.id, b.name)}
            />
          ))}
        </div>
      )}

      {/* Modal de CRUD de Presupuestos */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar límite de presupuesto?"
        description={`¿Estás seguro de que deseas eliminar el límite de presupuesto establecido para la categoría "${deleteTargetName}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};
export default BudgetsPage;
