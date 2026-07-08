import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Home,
  Zap,
  Heart,
  Film,
  BookOpen,
  MinusCircle,
  Briefcase,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  Bell,
  Activity,
  ShieldCheck,
  LogIn,
  Calendar,
  CreditCard,
  Landmark,
  Target,
  Settings as SettingsIcon
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { KPIOverview } from './components/KPIOverview.jsx';
import { EvolutionChart } from './components/EvolutionChart.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../../components/ui/Button.jsx';

const ICON_MAP = {
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  'credit-card': DollarSign,
  'plus-circle': Plus,
  'shopping-bag': ShoppingBag,
  truck: TrendingDown,
  home: Home,
  zap: Zap,
  heart: Heart,
  film: Film,
  'book-open': BookOpen,
  'minus-circle': MinusCircle
};

export const DashboardPage = () => {
  const {
    dashboard,
    transactions,
    categories,
    budgets,
    investments,
    creditCards,
    savingsGoals,
    bankAccounts,
    setTransactionModalOpen,
    setImportModalOpen,
    setCurrentPage
  } = useFinanceStore();

  const [filterPeriod, setFilterPeriod] = useState('todo'); // 'todo', 'hoy', 'semana', 'mes'

  const renderCategoryIcon = (iconName, color) => {
    const IconComponent = ICON_MAP[iconName] || MinusCircle;
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${color}15`,
          color: color
        }}
      >
        <IconComponent size={20} />
      </div>
    );
  };

  // Obtener las últimas 5 transacciones registradas
  const latestTransactions = transactions.slice(0, 5);
  // --- Sub-componente: Desglose de Gastos (Expense Breakdown) ---
  const ExpenseBreakdown = () => {
    // 1. Filtrar transacciones de tipo 'gasto' por el periodo seleccionado
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Inicio de la semana calendario (lunes)
    const getStartOfWeek = () => {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    };
    const startOfWeek = getStartOfWeek();

    // Inicio del mes calendario
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const parseLocalDate = (dateStr) => {
      if (!dateStr) return new Date();
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
      return new Date(dateStr);
    };

    const filteredExpenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      
      const txDate = parseLocalDate(t.date);

      if (filterPeriod === 'hoy') {
        const txDateStr = t.date.split('T')[0];
        return txDateStr === todayStr;
      }
      if (filterPeriod === 'semana') {
        return txDate >= startOfWeek;
      }
      if (filterPeriod === 'mes') {
        return txDate >= startOfMonth;
      }
      return true;
    });

    // 2. Agrupar montos de gastos por categoría
    const categoryTotals = {};
    let totalAllExpenses = 0;

    filteredExpenses.forEach(t => {
      const amount = parseFloat(t.amount || 0);
      totalAllExpenses += amount;
      
      const catId = t.category_id;
      if (!categoryTotals[catId]) {
        const cat = categories.find(c => c.id === catId);
        categoryTotals[catId] = {
          category_name: cat ? cat.name : 'Otros',
          category_color: cat ? cat.color : '#cbd5e1',
          total: 0
        };
      }
      categoryTotals[catId].total += amount;
    });

    // Convertir a array ordenado de mayor a menor gasto
    const expensesByCategory = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total);

    const topExpenses = expensesByCategory.slice(0, 5);

    const displayCategories = topExpenses.map((cat, idx) => {
      const percentage = totalAllExpenses > 0 ? Math.round((cat.total / totalAllExpenses) * 100) : 0;
      const defaultColors = ['#10b981', '#72a5e4', '#ef4444', '#f59e0b', '#6366f1'];
      return {
        name: cat.category_name,
        total: cat.total,
        percentage,
        color: cat.category_color || defaultColors[idx] || '#cbd5e1'
      };
    });

    const totalExpenseDisplay = totalAllExpenses;

    return (
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-base font-extrabold text-slate-800">Desglose de Gastos</span>
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/60 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-700 font-bold cursor-pointer outline-none focus:border-indigo-400 transition-all select-none"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="todo">Todo</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none">▼</span>
          </div>
        </div>

        {topExpenses.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-8 gap-3.5">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100/60 shadow-sm shrink-0">
              <TrendingDown size={22} className="text-slate-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Sin gastos registrados</h4>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] mt-0.5 mx-auto leading-relaxed">
                Tus consumos se desglosarán automáticamente por categoría aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-start gap-4">
            {/* SVG Concentric Rings */}
            <div className="flex justify-center items-center py-2">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {displayCategories.map((cat, idx) => {
                    const r = 50 - idx * 6;
                    const strokeWidth = 4.8;
                    const circumference = 2 * Math.PI * r;
                    const strokeDashoffset = circumference * (1 - (cat.percentage / 100));
                    return (
                      <g key={idx}>
                        {/* Background track ring */}
                        <circle cx="60" cy="60" r={r} fill="none" stroke="#f8fafc" strokeWidth={strokeWidth} />
                        {/* Active colored segment */}
                        <circle
                          cx="60"
                          cy="60"
                          r={r}
                          fill="none"
                          stroke={cat.color}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Centered Total */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 leading-none">Gasto Total</span>
                  <span className="text-base font-black text-slate-800 mt-1 leading-none">
                    {formatCurrency(totalExpenseDisplay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Labels below */}
            <div className="flex flex-col gap-2.5 mt-2">
              {displayCategories.map((cat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[140px]" title={cat.name}>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800">{formatCurrency(cat.total)}</span>
                    <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // --- Sub-componente: Planes de Ahorro (Saving Plans) ---
  const SavingPlans = () => {
    const totalSaved = savingsGoals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);

    return (
    <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center w-full mb-4">
        <span className="text-base font-extrabold text-slate-800">Planes de Ahorro</span>
        <button 
          onClick={() => setCurrentPage('savings-goals')}
          className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          + Añadir Plan
        </button>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ahorro Total</span>
        <span className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(totalSaved)}</span>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2 text-center">
          <Target size={28} className="text-indigo-300" />
          <p className="text-xs font-semibold text-slate-500">Sin planes de ahorro activos</p>
          <button
            onClick={() => setCurrentPage('savings-goals')}
            className="mt-1 py-1.5 px-3 rounded-xl text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer"
          >
            Crear Plan
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {savingsGoals.map(goal => {
            const current = parseFloat(goal.current_amount || 0);
            const target = parseFloat(goal.target_amount || 0);
            const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
            const colorTheme = goal.color_theme || '#6366f1';

            return (
              <div key={goal.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{goal.name}</span>
                  <span className="text-slate-400 font-bold text-[9px]">{formatCurrency(current)} / {formatCurrency(target)}</span>
                </div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: colorTheme }} 
                  />
                </div>
                <span 
                  className="text-[9px] font-extrabold text-right"
                  style={{ color: colorTheme }}
                >
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
    );
  };

  // --- Sub-componente: Límites de Presupuesto (Budget Limits) ---
  const BudgetLimits = () => {
    // Obtener transacciones de gastos
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Construir los presupuestos consolidados
    const budgetsData = categories
      .filter(c => c.type === 'expense')
      .map(c => {
        const dbBudget = budgets.find(b => b.category_id === c.id);
        const limit = dbBudget ? parseFloat(dbBudget.limit_amount) : null;

        const spent = expenseTransactions
          .filter(t => t.category_id === c.id)
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        return {
          category_id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          spent,
          limit
        };
      });

    // Presupuestos con límites activos (distintos de null)
    const activeBudgets = budgetsData.filter(b => b.limit !== null);

    return (
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-base font-extrabold text-slate-800">Límites de Presupuesto</span>
          <button
            onClick={() => setCurrentPage('budgets')}
            className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
          >
            Ver Todos
          </button>
        </div>

        {activeBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-3 text-center">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
              <Wallet size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-xs text-slate-800">Sin presupuestos activos</p>
              <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Configura límites mensuales para monitorear tus consumos.</span>
            </div>
            <button
              onClick={() => setCurrentPage('budgets')}
              className="mt-2 py-1.5 px-3 rounded-xl text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus size={12} />
              Configurar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
            {activeBudgets.map(b => {
              const IconComponent = ICON_MAP[b.icon] || MinusCircle;
              const percentage = b.limit > 0 ? Math.min(Math.round((b.spent / b.limit) * 100), 100) : 0;
              const isOverBudget = b.spent > b.limit;

              return (
                <div
                  key={b.category_id}
                  className="border border-slate-100 bg-slate-50/10 rounded-2xl p-3 flex flex-col gap-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${b.color}15`,
                          color: b.color
                        }}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{b.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Límite mensual</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      {formatCurrency(b.limit)}
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="flex flex-col gap-1.5">
                    <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                      <span className={isOverBudget ? 'text-rose-600 font-extrabold' : 'text-slate-400'}>
                        {percentage}% {isOverBudget ? 'excedido' : 'consumido'}
                      </span>
                      <span className="text-slate-500">
                        Gastado: {formatCurrency(b.spent)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  // --- Sub-componente: Cuentas Bancarias (Bank Accounts Card) ---
  const BankAccountsCard = () => {
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    return (
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-base font-extrabold text-slate-800">Cuentas Bancarias</span>
          <button 
            onClick={() => setCurrentPage('bank-accounts')}
            className="text-slate-400 hover:text-indigo-500 font-extrabold text-lg transition-colors cursor-pointer"
            title="Administrar cuentas"
          >
            ···
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-6 gap-3.5">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-100/50">
              <Landmark size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Sin cuentas asociadas</h4>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mt-0.5 mx-auto leading-relaxed">
                Asocia tus cuentas bancarias para ver tus saldos en tiempo real.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage('bank-accounts')}
              className="!py-2 !px-3.5 !text-xs !rounded-lg"
            >
              Agregar Cuenta
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1 mb-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saldo Total en Bancos</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(totalBankBalance)}</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {bankAccounts.map((acc, index) => {
                const isCash = acc.name.toLowerCase() === 'efectivo' || acc.bank_name.toLowerCase() === 'efectivo';
                const colorClass = 'from-[#1e293b] to-[#0f172a] shadow-[0_4px_12px_rgba(15,23,42,0.08)]';
                const label = isCash ? 'CASH' : 'BANK';

                return (
                  <div
                    key={acc.id}
                    className={`text-white p-4.5 rounded-2xl flex items-center justify-between border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] relative overflow-hidden bg-gradient-to-br ${colorClass} group shrink-0`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.03] text-6xl font-extrabold select-none pointer-events-none uppercase">
                      {label}
                    </div>
                    <div className="flex items-center gap-3.5 z-10 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#0f172a]/60 border border-white/10 w-12 h-9 rounded-lg flex items-center justify-center font-bold text-[10px] text-white tracking-wider shrink-0">
                          {label}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/70 font-bold uppercase tracking-wider line-clamp-1 max-w-[130px]" title={acc.name}>
                            {acc.name}
                          </span>
                          <span className="text-[9px] text-white/50 font-mono tracking-widest mt-0.5">
                            {isCash ? 'Dinero Efectivo' : `•••• ${acc.last_digits}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black tracking-tight">{formatCurrency(acc.balance)}</span>
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">{isCash ? 'Efectivo' : acc.bank_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    );
  };

  // --- Sub-componente: Tarjetas de Saldo (Balance Cards) ---
  const BalanceCards = () => {
    const totalCreditCardsBalance = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);

    return (
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-base font-extrabold text-slate-800">Tarjetas de Crédito</span>
          <button 
            onClick={() => setCurrentPage('credit-cards')}
            className="text-slate-400 hover:text-indigo-500 font-extrabold text-lg transition-colors cursor-pointer"
            title="Administrar tarjetas"
          >
            ···
          </button>
        </div>

        {creditCards.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-6 gap-3.5">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-100/50">
              <CreditCard size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Sin tarjetas asociadas</h4>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mt-0.5 mx-auto leading-relaxed">
                Asocia tus tarjetas de crédito para ver tus saldos en tiempo real.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage('credit-cards')}
              className="!py-2 !px-3.5 !text-xs !rounded-lg"
            >
              Agregar Tarjeta
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1 mb-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saldo Deudor Total</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(totalCreditCardsBalance)}</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {creditCards.map((card) => {
                const isVisa = card.brand === 'Visa';
                const isMC = card.brand === 'Mastercard';
                const isAmex = card.brand === 'American Express';
                
                let brandLabel = 'OTRO';
                let brandColor = 'text-slate-300';
                if (isVisa) {
                  brandLabel = 'VISA';
                  brandColor = 'text-emerald-400';
                } else if (isMC) {
                  brandLabel = 'MC';
                  brandColor = 'text-[#72a5e4]';
                } else if (isAmex) {
                  brandLabel = 'AMEX';
                  brandColor = 'text-cyan-400';
                }

                return (
                  <div
                    key={card.id}
                    className="text-white p-4.5 rounded-2xl flex items-center justify-between border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative overflow-hidden group shrink-0"
                    style={{ backgroundColor: card.color_theme || '#121620' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.02] text-6xl font-extrabold select-none pointer-events-none uppercase">
                      {brandLabel}
                    </div>
                    <div className="flex items-center gap-3.5 z-10 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`bg-[#0f172a]/60 border border-white/10 w-12 h-9 rounded-lg flex items-center justify-center font-bold text-[9px] ${brandColor} tracking-wider shrink-0`}>
                          {brandLabel}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider line-clamp-1 max-w-[150px]">
                            {card.card_name}
                          </span>
                          <span className="text-[9px] text-white/40 font-mono tracking-widest mt-0.5">
                            •••• {card.last_digits}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black tracking-tight">{formatCurrency(card.balance)}</span>
                        <span className="text-[8px] text-white/30 font-bold uppercase tracking-wider">{card.bank}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    );
  };

  // --- Sub-componente: Actividades Recientes (Recent Activities) ---
  const RecentActivities = () => {
    const activeActivities = transactions.slice(0, 4).map(tx => {
      const isIncome = tx.type === 'income';
      const dateObj = new Date(tx.date);
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateLabel = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return {
        id: tx.id,
        title: isIncome ? `Registró un ingreso: ${tx.description}` : `Registró un gasto: ${tx.description}`,
        time: `${dateLabel} - ${timeStr}`,
        type: isIncome ? 'income' : 'expense'
      };
    });

    return (
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center w-full mb-5">
          <span className="text-base font-extrabold text-slate-800">Actividades Recientes</span>
          <button className="text-slate-400 hover:text-slate-600 font-extrabold text-lg">···</button>
        </div>

        {activeActivities.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-6 gap-3.5">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100/60 shadow-sm shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Sin actividades recientes</h4>
              <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] mt-0.5 mx-auto leading-relaxed">
                Tus transacciones y eventos recientes se mostrarán aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 text-slate-800">
            <div className="flex flex-col gap-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historial Reciente</span>
              {activeActivities.map((act, idx) => (
                <div key={act.id} className="flex gap-3 relative">
                  {idx < activeActivities.length - 1 && (
                    <div className="absolute left-[13px] top-[26px] bottom-[-22px] w-[2px] bg-slate-100" />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                    act.type === 'income' 
                      ? 'bg-emerald-50 text-emerald-500 border-emerald-100/50' 
                      : 'bg-rose-50 text-rose-500 border-rose-100/50'
                  }`}>
                    <Activity size={12} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-800">{act.title}</span>
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Grid del Dashboard en 3 Columnas según la maqueta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">

        {/* Columna 1 (Izquierda): 4 KPIs (2x2) + Cashflow Chart + Recent Transactions */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          <KPIOverview summary={dashboard.summary} investments={investments} bankAccounts={bankAccounts} />

          <div className="h-[385px] shrink-0">
            <EvolutionChart monthlyHistory={dashboard.monthlyHistory} />
          </div>

          <Card className="flex flex-col h-full !bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex justify-between items-center w-full !mb-4 !p-6">
              <CardTitle>Transacciones Recientes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold cursor-pointer hover:bg-slate-100 transition-colors">
                  <span>Este Mes</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </div>
                <button className="bg-slate-50 border border-slate-200/60 hover:bg-slate-100 p-2 rounded-xl text-slate-500 cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="!p-0 overflow-x-auto">
              {latestTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 text-center">
                  <MinusCircle size={36} className="text-slate-500" />
                  <p className="text-sm">No hay movimientos registrados.</p>
                  <Button variant="secondary" onClick={() => setImportModalOpen(true)} className="!py-2 !px-4 mt-2">
                    Añadir Uno
                  </Button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Nombre de Transacción</th>
                      <th className="py-3.5 px-4">Cuenta</th>
                      <th className="py-3.5 px-4">Fecha y Hora</th>
                      <th className="py-3.5 px-4">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-800 text-xs font-semibold">
                    {latestTransactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const hasAccount = !!tx.bank_account_name;
                      const accountLabel = hasAccount
                        ? { type: 'Banco', name: `${tx.bank_account_name} (•••• ${tx.bank_account_digits})` }
                        : { type: 'Efectivo', name: 'Efectivo' };

                      const cat = categories.find(c => c.id === tx.category_id);
                      const catName = cat ? cat.name : (isIncome ? 'Ingresos' : 'Gastos');

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            {renderCategoryIcon(tx.category_icon, tx.category_color)}
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-[13px]">{tx.description}</span>
                              <span className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">{catName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                !hasAccount 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' 
                                  : hasAccount 
                                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/30' 
                                  : 'bg-slate-100 text-slate-500 border border-slate-200/30'
                                }`}>
                                {accountLabel.type}
                              </span>
                              <span className="text-slate-500 font-bold text-[11px] max-w-[150px] truncate" title={accountLabel.name}>
                                {accountLabel.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-400 font-bold text-[11px]">
                            {formatDate(tx.date)}
                          </td>
                          <td className={`py-4 px-4 font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna 2 (Medio): Expense Breakdown + Saving Plans */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <ExpenseBreakdown />
          <SavingPlans />
        </div>

        {/* Columna 3 (Derecha): Finance Score + Balance + Recent Activities */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <BudgetLimits />
          <BankAccountsCard />
          <BalanceCards />
          <RecentActivities />
        </div>

      </div>
    </div>
  );
};
export default DashboardPage;
