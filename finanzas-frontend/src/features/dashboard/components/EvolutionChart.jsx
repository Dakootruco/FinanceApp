import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.jsx';
import { LineChart } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export const EvolutionChart = ({ monthlyHistory = [] }) => {
  // Helper para traducir YYYY-MM a abreviatura en español
  const formatMonthLabel = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return dateStr;
    const month = parseInt(parts[1], 10) - 1;
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return monthNames[month] || dateStr;
  };

  // Datos de reserva si no hay historial en la base de datos
  const defaultData = [
    { month: 'Ene', income: 1000, expense: 800 },
    { month: 'Feb', income: 2200, expense: 1800 },
    { month: 'Mar', income: 3000, expense: 2400 },
    { month: 'Abr', income: 2000, expense: 1900 },
    { month: 'May', income: 3100, expense: 2200 },
    { month: 'Jun', income: 2900, expense: 2800 },
    { month: 'Jul', income: 5200, expense: 4100 },
    { month: 'Ago', income: 4200, expense: 3200 },
    { month: 'Sep', income: 3100, expense: 2600 },
    { month: 'Oct', income: 3600, expense: 3000 },
    { month: 'Nov', income: 4700, expense: 3400 },
    { month: 'Dic', income: 5100, expense: 3600 }
  ];

  // Integrar datos reales del backend si están disponibles
  let chartData = [];
  if (monthlyHistory.length > 0) {
    chartData = monthlyHistory.map(row => ({
      month: formatMonthLabel(row.month),
      income: parseFloat(row.income || 0),
      expense: parseFloat(row.expense || 0)
    }));

    // Si solo hay un mes de datos, agregamos un mes previo en 0 para trayectoria
    if (chartData.length === 1) {
      let prevMonthLabel = 'Mes Anterior';
      const rawMonth = monthlyHistory[0].month;
      if (rawMonth && rawMonth.includes('-')) {
        const [yearStr, monthStr] = rawMonth.split('-');
        let year = parseInt(yearStr, 10);
        let month = parseInt(monthStr, 10);
        month -= 1;
        if (month === 0) {
          month = 12;
          year -= 1;
        }
        const prevMonthStr = `${year}-${String(month).padStart(2, '0')}`;
        prevMonthLabel = formatMonthLabel(prevMonthStr);
      }

      chartData.unshift({
        month: prevMonthLabel,
        income: 0,
        expense: 0
      });
    }
  } else {
    chartData = [];
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-4 shadow-xl text-white font-sans text-xs flex flex-col gap-2">
          <p className="font-black tracking-wide uppercase text-slate-400 border-b border-white/10 pb-1 mb-1">{label}</p>
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

  const totalSaved = chartData.reduce((sum, d) => sum + (d.income - d.expense), 0);
  const finalBalanceDisplay = Math.max(totalSaved, 0);

  return (
    <Card className="flex flex-col h-full !bg-white border border-slate-100 rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <CardHeader className="!mb-4 !p-0">
        <div className="flex justify-between items-start w-full">
          <div>
            <span className="text-base font-extrabold text-slate-800">Flujo de Caja</span>
            <div className="flex flex-col gap-0.5 mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ahorro Neto Acumulado</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {formatCurrency(finalBalanceDisplay)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold cursor-pointer hover:bg-slate-100 transition-colors">
              <span>Mensual</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 min-h-[260px]">
        {monthlyHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-3 text-center py-6">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
              <LineChart size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-xs text-slate-700">Sin historial de flujo de caja</p>
              <span className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-[200px]">
                Registra transacciones de ingresos y gastos para generar el gráfico de evolución.
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
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
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}
                />
                <Area 
                  name="Ingresos"
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#incomeGrad)" 
                />
                <Area 
                  name="Gastos"
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#expenseGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionChart;
