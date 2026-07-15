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
  Settings as SettingsIcon,
  Fuel
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { KPIOverview } from './components/KPIOverview.jsx';
import { EvolutionChart } from './components/EvolutionChart.jsx';
import { getBankStyles } from '../../utils/bankStyles.jsx';
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
  'minus-circle': MinusCircle,
  fuel: Fuel
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

            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {bankAccounts.map((acc) => {
                const isCash = acc.name.toLowerCase() === 'efectivo' || acc.bank_name.toLowerCase() === 'efectivo';
                const { gradient, logo } = getBankStyles(acc.bank_name);

                return (
                  <div
                    key={acc.id}
                    className={`text-white p-3.5 rounded-2xl flex flex-col justify-between aspect-[1.15/1] border border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden bg-gradient-to-br ${gradient} group shrink-0`}
                  >
                    {/* Fondo semitransparente de textura */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    {/* Fila superior: Logo y últimos dígitos */}
                    <div className="flex justify-between items-start z-10 w-full">
                      <div className="scale-90 -origin-top-left shrink-0">{logo}</div>
                      <span className="text-[8px] font-mono tracking-widest text-white/60">
                        {isCash ? 'CASH' : `•• ${acc.last_digits}`}
                      </span>
                    </div>

                    {/* Fila inferior: Nombre y Balance */}
                    <div className="z-10 flex flex-col mt-2">
                      <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider truncate" title={acc.name}>
                        {acc.name}
                      </span>
                      <span className="text-sm font-black tracking-tight leading-none mt-1">
                        {formatCurrency(acc.balance)}
                      </span>
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

            <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {creditCards.map((card) => {
                const isVisa = card.brand === 'Visa';
                const isMC = card.brand === 'Mastercard';
                const isAmex = card.brand === 'American Express';
                
                let brandLogo = (
                  <span className="text-[7px] font-black text-white bg-slate-700 px-1.5 py-0.5 rounded leading-none shrink-0 tracking-wider">OTRO</span>
                );

                if (isVisa) {
                  brandLogo = (
                    <svg viewBox="0 0 24 24" className="h-4.5 w-auto select-none text-white fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
                    </svg>
                  );
                } else if (isMC) {
                  brandLogo = (
                    <svg viewBox="0 0 40 24" className="h-5 select-none shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#eb001b" />
                      <circle cx="28" cy="12" r="12" fill="#ff5f00" />
                      <path d="M20,2.9 A12,12 0 0,0 20,21.1 A12,12 0 0,0 20,2.9 Z" fill="#f79e1b" />
                    </svg>
                  );
                } else if (isAmex) {
                  brandLogo = (
                    <span className="text-[7px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded leading-none shrink-0 tracking-wider">AMEX</span>
                  );
                }

                const mockMonth = String((card.id % 12) + 1).padStart(2, '0');
                const mockYear = String(28 + (card.id % 5));
                const expiryDate = `${mockMonth}/${mockYear}`;

                return (
                  <div
                    key={card.id}
                    className="text-white p-4.5 rounded-2xl h-36 flex flex-col justify-between relative overflow-hidden border border-white/5 shadow-md shrink-0 w-full"
                    style={{ backgroundColor: card.color_theme || '#121620' }}
                  >
                    {/* Capa de división curva bicolor */}
                    <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-white/[0.04] rounded-l-full pointer-events-none" />
                    <div className="absolute right-[-10%] top-[-20%] w-[50%] h-[140%] rounded-full bg-white/[0.02] blur-xl pointer-events-none" />

                    {/* Fila Superior: Banco y Nombre de Tarjeta */}
                    <div className="flex justify-between items-start z-10 w-full">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold tracking-tight text-white/95 leading-none">{card.bank}</span>
                        <span className="text-[8px] text-white/50 font-medium uppercase tracking-wider mt-0.5 leading-none">{card.card_name}</span>
                      </div>
                    </div>

                    {/* Fila Central: Chip y Contactless en la izquierda, Saldo deudor en la derecha */}
                    <div className="flex justify-between items-center z-10 w-full mt-1">
                      {/* Chip & Waves */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Chip dorado */}
                        <div className="w-8 h-5.5 rounded bg-gradient-to-br from-[#e5c060] via-[#ffd97d] to-[#b39239] opacity-95 border border-white/15 relative p-0.5 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                          <div className="flex justify-between h-1">
                            <div className="w-2 h-full border-r border-b border-black/10" />
                            <div className="w-2 h-full border-l border-b border-black/10" />
                          </div>
                          <div className="w-full h-0.5 border-y border-black/10" />
                          <div className="flex justify-between h-1">
                            <div className="w-2 h-full border-r border-t border-black/10" />
                            <div className="w-2 h-full border-l border-t border-black/10" />
                          </div>
                        </div>

                        {/* Contactless waves SVG */}
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60 rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                          <path d="M16.24 16.24a6 6 0 0 0-8.49 0" />
                          <path d="M19.07 13.41a10 10 0 0 0-14.14 0" />
                        </svg>
                      </div>

                      {/* Saldo deudor en la derecha */}
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black tracking-tight text-white">{formatCurrency(card.balance)}</span>
                        <span className="text-[7px] text-white/45 font-bold uppercase tracking-widest leading-none mt-0.5">Saldo deudor</span>
                      </div>
                    </div>

                    {/* Número de tarjeta en el centro */}
                    <div className="z-10 -mt-1">
                      <span className="text-xs font-mono text-white/95 tracking-[0.2em] block leading-none">
                        ••••  ••••  ••••  {card.last_digits}
                      </span>
                    </div>

                    {/* Fila Inferior: Vencimiento y Marca */}
                    <div className="flex justify-between items-end z-10 w-full border-t border-white/10 pt-2">
                      <div className="flex flex-col leading-none">
                        <span className="text-[6px] text-white/40 font-bold uppercase tracking-widest">Valid Thru</span>
                        <span className="text-[8px] font-semibold text-white/85 tracking-wide mt-0.5">Vence {expiryDate}</span>
                      </div>
                      <div className="flex items-center h-4.5">
                        {brandLogo}
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

  // --- Sub-componente: Tabla de Transacciones Recientes (Recent Transactions Card) ---
  const RecentTransactionsCard = () => {
    return (
      <Card className="flex flex-col h-full !bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex justify-between items-center w-full !mb-4 !p-6">
          <CardTitle>Transacciones Recientes</CardTitle>
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
                              : 'bg-slate-100 text-slate-55 border border-slate-200/30'
                            }`}>
                            {accountLabel.type}
                          </span>
                          <span className="text-slate-55 font-bold text-[11px] max-w-[150px] truncate" title={accountLabel.name}>
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
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full">

      {/* VISTA ESCRITORIO (3 Columnas Perfectas sin Gaps Verticales de Fila) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start w-full">
        {/* Columna 1 (Izquierda): KPIs + Flujo de Caja + Transacciones Recientes */}
        <div className="col-span-6 flex flex-col gap-6">
          <KPIOverview summary={dashboard.summary} investments={investments} bankAccounts={bankAccounts} />
          <div className="h-[385px] shrink-0">
            <EvolutionChart monthlyHistory={dashboard.monthlyHistory} />
          </div>
          <RecentTransactionsCard />
        </div>

        {/* Columna 2 (Medio): Gastos + Metas de Ahorro */}
        <div className="col-span-3 flex flex-col gap-6">
          <ExpenseBreakdown />
          <SavingPlans />
        </div>

        {/* Columna 3 (Derecha): Tarjetas + Bancos + Presupuestos + Actividades */}
        <div className="col-span-3 flex flex-col gap-6">
          <BalanceCards />
          <BankAccountsCard />
          <BudgetLimits />
          <RecentActivities />
        </div>
      </div>

      {/* VISTA MÓVIL (Orden Secuencial Personalizado) */}
      <div className="flex flex-col gap-6 lg:hidden w-full">
        <KPIOverview summary={dashboard.summary} investments={investments} bankAccounts={bankAccounts} />
        <ExpenseBreakdown />
        <RecentTransactionsCard />
        <BalanceCards />
        <BankAccountsCard />
        <BudgetLimits />
        <SavingPlans />
        <div className="h-[385px] shrink-0">
          <EvolutionChart monthlyHistory={dashboard.monthlyHistory} />
        </div>
        <RecentActivities />
      </div>

    </div>
  );
};
export default DashboardPage;
