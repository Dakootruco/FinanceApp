import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  Printer, 
  PieChart, 
  HelpCircle, 
  Activity, 
  Wallet,
  Landmark,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../components/ui/Input.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export const ReportsPage = () => {
  const { 
    reportsData, 
    fetchReportsData, 
    bankAccounts, 
    transactions,
    showAlert
  } = useFinanceStore();

  // Fechas por defecto (Mes actual: desde el primer día hasta hoy)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12
  const defaultStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const defaultEndDate = today.toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    bank_account_id: 'all'
  });

  // Cargar datos cada vez que los filtros cambien
  useEffect(() => {
    // Si se selecciona "efectivo", mapear al ID del banco "Efectivo"
    let apiAccountId = filters.bank_account_id;
    if (filters.bank_account_id === 'efectivo') {
      const cashAcc = bankAccounts.find(a => a.name.toLowerCase() === 'efectivo');
      apiAccountId = cashAcc ? cashAcc.id.toString() : 'all';
    }
    
    fetchReportsData({
      startDate: filters.startDate,
      endDate: filters.endDate,
      bank_account_id: apiAccountId
    });
  }, [filters, bankAccounts, fetchReportsData]);

  const { summary, categories, monthly, paymentMethods } = reportsData;

  // Clasificación del semáforo de la tasa de ahorro
  const getSavingsRateCategory = (rate) => {
    if (rate >= 20) return { label: 'Excelente', color: 'text-emerald-600 bg-emerald-50 border-emerald-100/35' };
    if (rate >= 10) return { label: 'Saludable', color: 'text-indigo-600 bg-indigo-50 border-indigo-100/35' };
    if (rate > 0) return { label: 'Bajo', color: 'text-amber-600 bg-amber-50 border-amber-100/35' };
    return { label: 'Déficit', color: 'text-rose-600 bg-rose-50 border-rose-100/35' };
  };

  const savingsRateInfo = getSavingsRateCategory(summary.savingsRate);

  // Paleta de colores predeterminada para el gráfico de torta de Recharts
  const COLORS = ['#6366F1', '#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#6B7280'];

  // Formatear datos de dona
  const pieData = categories.map((cat, index) => ({
    name: cat.name,
    value: parseFloat(cat.total),
    color: cat.color || COLORS[index % COLORS.length]
  }));

  // Tooltip personalizado para Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-4 shadow-xl text-white font-sans text-xs flex flex-col gap-2">
          {label && <p className="font-black tracking-wide uppercase text-slate-400 border-b border-white/10 pb-1 mb-1">{label}</p>}
          <div className="flex flex-col gap-1.5 font-bold">
            {payload.map((p, idx) => (
              <span key={idx} style={{ color: p.color || p.fill }}>
                {p.name}: {formatCurrency(p.value)}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const filteredTx = transactions.filter(tx => {
      const txDate = tx.date.split('T')[0];
      const matchStart = filters.startDate ? txDate >= filters.startDate : true;
      const matchEnd = filters.endDate ? txDate <= filters.endDate : true;
      let matchAccount = true;
      if (filters.bank_account_id && filters.bank_account_id !== 'all') {
        if (filters.bank_account_id === 'efectivo') {
          const cashAcc = bankAccounts.find(a => a.name.toLowerCase() === 'efectivo');
          matchAccount = tx.bank_account_id === (cashAcc ? cashAcc.id : null);
        } else {
          matchAccount = tx.bank_account_id === parseInt(filters.bank_account_id, 10);
        }
      }
      return matchStart && matchEnd && matchAccount;
    });

    if (filteredTx.length === 0) {
      showAlert('Sin datos', 'No hay movimientos en este rango de fechas para exportar.', 'info');
      return;
    }

    let csvContent = 'Fecha,Descripcion,Tipo,Categoria,Cuenta,Monto\n';

    filteredTx.forEach(tx => {
      const typeLabel = tx.type === 'income' ? 'Ingreso' : 'Gasto';
      const accountLabel = tx.bank_account_name || 'Sin Cuenta';
      const categoryLabel = tx.category_name || 'Sin Categoria';
      const descriptionSafe = tx.description.replace(/"/g, '""');
      
      csvContent += `"${tx.date.split('T')[0]}","${descriptionSafe}","${typeLabel}","${categoryLabel}","${accountLabel}",${parseFloat(tx.amount)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_finanzas_${filters.startDate}_a_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 font-sans print-full-width">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print-area">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-indigo-400" size={24} />
            Reportes Avanzados
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Analiza y visualiza en profundidad la distribución de tus ingresos, gastos y hábitos financieros.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Button variant="secondary" onClick={handleExportCSV} className="flex-grow sm:flex-grow-0 justify-center flex items-center gap-1.5">
            <Download size={14} />
            Exportar CSV
          </Button>
          <Button variant="primary" onClick={() => window.print()} className="flex-grow sm:flex-grow-0 justify-center flex items-center gap-1.5">
            <Printer size={14} />
            Imprimir Reporte (PDF)
          </Button>
        </div>
      </div>

      {/* Título sólo visible al imprimir en PDF */}
      <div className="hidden print:block mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Finanzas Pro - Reporte Financiero</h1>
        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
          Período: {formatDate(filters.startDate)} al {formatDate(filters.endDate)}
        </p>
      </div>

      {/* Contenedor de Filtros (Oculto al imprimir) */}
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 filters-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormGroup label="Fecha Inicio">
            <Input 
              type="date" 
              value={filters.startDate} 
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </FormGroup>
          <FormGroup label="Fecha Fin">
            <Input 
              type="date" 
              value={filters.endDate} 
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </FormGroup>
          <FormGroup label="Cuenta / Metodo">
            <Select 
              value={filters.bank_account_id}
              onChange={(e) => setFilters(prev => ({ ...prev, bank_account_id: e.target.value }))}
            >
              <option value="all">Todas las cuentas</option>
              <option value="efectivo">Efectivo</option>
              {bankAccounts
                .filter(acc => acc.name.toLowerCase() !== 'efectivo')
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (•••• {acc.last_digits})
                  </option>
                ))
              }
            </Select>
          </FormGroup>
        </div>
      </Card>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Ingresos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 border border-emerald-100/30">
                <TrendingUp size={16} />
              </div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ingresos Totales</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 tracking-tight font-sans">
                {formatCurrency(summary.totalIncome)}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Capital ingresado en el período</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Gastos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100/30">
                <TrendingDown size={16} />
              </div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gastos Totales</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 tracking-tight font-sans">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Capital debitado en el período</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Ahorro y Tasa */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-500 border border-indigo-100/30">
                  <Activity size={16} />
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tasa de Ahorro</span>
              </div>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-bold text-[9px] border ${savingsRateInfo.color}`}>
                {savingsRateInfo.label}
              </span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 tracking-tight font-sans">
                {summary.savingsRate}%
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                Ahorrado: {formatCurrency(summary.savings)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Gasto Promedio y Top */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500 border border-amber-100/30">
                <DollarSign size={16} />
              </div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Promedio Diario</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 tracking-tight font-sans">
                {formatCurrency(summary.avgDailySpend)}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 truncate" title={`Mayor Gasto: ${summary.topCategory.name}`}>
                Max: {summary.topCategory.name} ({formatCurrency(summary.topCategory.amount)})
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Fila de Gráficos (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-page-break">
        
        {/* Gráfico 1 (Barras Agrupadas): Flujo Histórico */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 lg:col-span-8 flex flex-col min-h-[380px]">
          <CardHeader className="!p-0 !mb-5">
            <CardTitle className="text-sm font-extrabold text-slate-800">Comparativa Mensual (Ingresos vs Gastos)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow relative w-full h-[290px] min-h-[290px]">
            {monthly.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                Sin datos históricos para el rango seleccionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 15, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}
                  />
                  <Bar name="Ingresos" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar name="Gastos" dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2 (Pie/Dona): Distribución de Gastos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 lg:col-span-4 flex flex-col min-h-[380px]">
          <CardHeader className="!p-0 !mb-5">
            <CardTitle className="text-sm font-extrabold text-slate-800">Distribución de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col justify-center relative w-full h-[290px] min-h-[290px]">
            {pieData.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                No hay consumos de gastos en este período
              </div>
            ) : (
              <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-1/2 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                {/* Leyenda Detallada */}
                <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {pieData.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <div className="flex items-center gap-1.5 truncate max-w-[90px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="truncate" title={entry.name}>{entry.name}</span>
                      </div>
                      <span className="text-slate-800">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  {pieData.length > 5 && (
                    <div className="text-[9px] text-slate-400 font-extrabold text-right mt-1">
                      + {pieData.length - 5} categorías más
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Tabla Desglose Detallado por Categoría */}
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 print-page-break">
        <CardHeader className="!p-0 !mb-5">
          <CardTitle className="text-sm font-extrabold text-slate-800">Eficiencia por Categoría de Gasto</CardTitle>
        </CardHeader>
        <CardContent className="!p-0 overflow-x-auto">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs font-semibold">
              Ningún gasto registrado para clasificar en categorías
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Transacciones</th>
                  <th className="py-3 px-4 text-right">Gastado</th>
                  <th className="py-3 px-4 text-right">Porcentaje</th>
                  <th className="py-3 px-4 text-right">Presupuesto Limite</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-800 text-xs font-semibold">
                {categories.map((cat, idx) => {
                  const spentPercent = summary.totalExpenses > 0 ? Math.round((cat.total / summary.totalExpenses) * 100) : 0;
                  const isOverBudget = cat.limit_amount && cat.total > cat.limit_amount;
                  
                  let budgetStatus = { label: 'Sin Limite', color: 'text-slate-500 bg-slate-50 border-slate-200/40' };
                  if (cat.limit_amount) {
                    budgetStatus = isOverBudget
                      ? { label: 'Excedido', color: 'text-rose-600 bg-rose-50 border-rose-100/30' }
                      : { label: 'En Regla', color: 'text-emerald-600 bg-emerald-50 border-emerald-100/30' };
                  }

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Categoría */}
                      <td className="py-3.5 px-4 flex items-center gap-2.5">
                        <span 
                          className="w-3 h-3 rounded-full border border-black/5 shrink-0" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <span className="text-[13px] font-bold text-slate-800">{cat.name}</span>
                      </td>

                      {/* Transacciones */}
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                        {cat.count}
                      </td>

                      {/* Gastado */}
                      <td className="py-3.5 px-4 text-right text-slate-800 font-black">
                        {formatCurrency(cat.total)}
                      </td>

                      {/* Porcentaje */}
                      <td className="py-3.5 px-4 text-right text-slate-500 font-bold">
                        {spentPercent}%
                      </td>

                      {/* Presupuesto */}
                      <td className="py-3.5 px-4 text-right text-slate-650 font-bold">
                        {cat.limit_amount ? formatCurrency(cat.limit_amount) : '—'}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] border ${budgetStatus.color}`}>
                          {budgetStatus.label}
                        </span>
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
  );
};

export default ReportsPage;
