import { useState } from 'react';
import { 
  Target, 
  PiggyBank, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

// Modales
import { SavingsGoalModal } from './components/SavingsGoalModal.jsx';
import { AdjustSavingsModal } from './components/AdjustSavingsModal.jsx';

export const SavingsGoalsPage = () => {
  const { savingsGoals, deleteSavingsGoal } = useFinanceStore();

  // Control de Modales
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [goalToAdjust, setGoalToAdjust] = useState(null);

  // --- CÁLCULOS GLOBALES ---
  const totalSaved = savingsGoals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0);
  const globalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalRemaining = totalTarget - totalSaved;

  // Objetivo más cercano a completarse
  const nearCompletion = [...savingsGoals]
    .map(g => ({
      ...g,
      percentage: parseFloat(g.target_amount) > 0 
        ? (parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100 
        : 0
    }))
    .filter(g => g.percentage < 100)
    .sort((a, b) => b.percentage - a.percentage)[0];

  // --- HANDLERS ---
  const handleCreate = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleEdit = (goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleAdjust = (goal) => {
    setGoalToAdjust(goal);
    setIsAdjustModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el plan de ahorro "${name}"?`)) {
      await deleteSavingsGoal(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Target className="text-indigo-400" size={24} />
            Objetivos de Ahorro
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Define metas claras de ahorro y monitorea tu progreso en tiempo real.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} />
          Nuevo Plan
        </Button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI: Total Ahorrado */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Ahorrado</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(totalSaved)}
            </span>
          </CardContent>
        </Card>

        {/* KPI: Meta Global */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta Global</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(totalTarget)}
            </span>
          </CardContent>
        </Card>

        {/* KPI: Progreso Global */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progreso Global</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600 tracking-tight">
                {globalProgress}%
              </span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(globalProgress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Restante */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Faltante por Ahorrar</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(Math.max(totalRemaining, 0))}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal: Listado (70%) vs Resumen (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Sección de Listado de Planes de Ahorro */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <PiggyBank size={18} className="text-indigo-400" />
            Tus Planes de Ahorro
          </h3>

          {savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3.5 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                <Target size={28} />
              </div>
              <div className="text-center flex flex-col gap-0.5 mt-1">
                <p className="font-bold text-sm text-slate-800">No hay planes de ahorro</p>
                <span className="text-xs text-slate-400 font-semibold">Crea un plan para comenzar a ahorrar con propósito.</span>
              </div>
              <Button variant="primary" onClick={handleCreate} className="mt-2">
                <Plus size={16} />
                Crear Primer Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savingsGoals.map(goal => {
                const currentAmount = parseFloat(goal.current_amount || 0);
                const targetAmount = parseFloat(goal.target_amount || 0);
                const percentage = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
                const isComplete = percentage >= 100;
                const colorTheme = goal.color_theme || '#6366f1';

                return (
                  <Card key={goal.id} className="!bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between h-[260px]">
                    <div className="flex flex-col gap-4">
                      {/* Cabecera del Plan */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ 
                              backgroundColor: `${colorTheme}15`, 
                              color: colorTheme 
                            }}
                          >
                            {isComplete ? <Award size={20} /> : <Target size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 truncate max-w-[160px]" title={goal.name}>
                              {goal.name}
                            </h4>
                            <span 
                              className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                              style={{ 
                                backgroundColor: `${colorTheme}10`, 
                                color: colorTheme,
                                border: `1px solid ${colorTheme}20`
                              }}
                            >
                              {isComplete ? '✓ Completado' : 'En Progreso'}
                            </span>
                          </div>
                        </div>

                        {/* Badge de progreso */}
                        <div 
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black"
                          style={{
                            backgroundColor: isComplete ? '#10b98115' : `${colorTheme}15`,
                            color: isComplete ? '#10b981' : colorTheme
                          }}
                        >
                          <TrendingUp size={12} />
                          <span>{Math.min(percentage, 100)}%</span>
                        </div>
                      </div>

                      {/* Barra de Progreso y Montos */}
                      <div className="flex flex-col gap-2.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl p-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Ahorrado</span>
                            <span className="font-extrabold text-slate-700 mt-0.5 block">
                              {formatCurrency(currentAmount)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Meta</span>
                            <span className="font-black text-slate-800 mt-0.5 block">
                              {formatCurrency(targetAmount)}
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="relative w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: isComplete ? '#10b981' : colorTheme
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Restante</span>
                        <span className="font-black text-xs text-slate-700">
                          {isComplete ? formatCurrency(0) : formatCurrency(targetAmount - currentAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjust(goal)}
                          className="py-1.5 px-2.5 rounded-lg text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer border border-indigo-100/20"
                          title="Aportar o retirar fondos"
                        >
                          Aportar
                        </button>
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id, goal.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección de Resumen */}
        <div className="flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            Resumen de Progreso
          </h3>

          <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distribución de Planes</span>
              
              {savingsGoals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs leading-relaxed">
                  No hay planes de ahorro registrados. Crea uno para ver la distribución.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {savingsGoals.map(goal => {
                    const currentAmount = parseFloat(goal.current_amount || 0);
                    const targetAmount = parseFloat(goal.target_amount || 0);
                    const percentage = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
                    const colorTheme = goal.color_theme || '#6366f1';
                    const share = totalSaved > 0 ? Math.round((currentAmount / totalSaved) * 100) : 0;

                    return (
                      <div key={goal.id} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{goal.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">{formatCurrency(currentAmount)}</span>
                            <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{percentage}%</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: colorTheme
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {savingsGoals.length > 0 && (
              <>
                {/* Próximo a Completar */}
                {nearCompletion && (
                  <div className="border-t border-slate-50 pt-5 mt-6 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Próximo a Completar</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: nearCompletion.color_theme || '#6366f1' }}
                      />
                      <span className="text-xs font-bold text-slate-800">{nearCompletion.name}</span>
                      <span 
                        className="text-[10px] font-extrabold ml-auto"
                        style={{ color: nearCompletion.color_theme || '#6366f1' }}
                      >
                        {Math.round(nearCompletion.percentage)}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-50 pt-5 mt-4 flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Total de Planes:</span>
                  <span className="font-bold text-slate-800">{savingsGoals.length}</span>
                </div>
              </>
            )}
          </Card>
        </div>

      </div>

      {/* MODALES DE GESTIÓN */}
      <SavingsGoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      <AdjustSavingsModal 
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setGoalToAdjust(null);
        }}
        savingsGoal={goalToAdjust}
      />

    </div>
  );
};
export default SavingsGoalsPage;
