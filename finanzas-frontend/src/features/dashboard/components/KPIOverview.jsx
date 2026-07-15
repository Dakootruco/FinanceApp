import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, LineChart } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export const KPIOverview = ({ summary = {}, investments = [], bankAccounts = [] }) => {
  const { totalIncome = 0, totalExpenses = 0, balance = 0, cashBalance = 0 } = summary;

  // Cálculos dinámicos de inversiones reales de la base de datos
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested || 0), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + parseFloat(inv.current_value || 0), 0);
  const totalReturn = investments.reduce((sum, inv) => sum + parseFloat(inv.net_return || 0), 0);
  
  const yieldPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const isInvestmentPositive = totalReturn >= 0;

  // El balance de bancos más el balance de efectivo (transacciones sin cuenta)
  const bankBalanceSum = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  
  // Si hay cuentas registradas, sumamos los bancos + el efectivo. Si no, usamos el balance de transacciones.
  const savingsValue = bankAccounts.length > 0
    ? bankBalanceSum + cashBalance
    : balance;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Ingresos Card */}
      <Card className="!bg-white border border-slate-100 text-slate-800 rounded-3xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <CardContent className="p-0 flex flex-col gap-2.5">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 border border-emerald-100/50">
                <ArrowUpRight size={16} />
              </div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ingresos</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-800 font-sans">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Total de ingresos registrados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos Card */}
      <Card className="!bg-white border border-slate-100 text-slate-800 rounded-3xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <CardContent className="p-0 flex flex-col gap-2.5">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100/50">
                <ArrowDownRight size={16} />
              </div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gastos</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-800 font-sans">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Total de gastos registrados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Total Card (replaces Savings/Ahorros) */}
      <Card className="!bg-white border border-slate-100 text-slate-800 rounded-3xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <CardContent className="p-0 flex flex-col gap-2.5">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-500 border border-indigo-100/50">
                <DollarSign size={16} />
              </div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Balance Total</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-800 font-sans">
              {formatCurrency(savingsValue)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Saldo disponible consolidado
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inversiones Card */}
      <Card className="!bg-white border border-slate-100 text-slate-800 rounded-3xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
        <CardContent className="p-0 flex flex-col gap-2.5">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-50 text-sky-500 border border-sky-100/50">
                <LineChart size={16} />
              </div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inversiones</span>
            </div>
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold text-[10px] border ${
              isInvestmentPositive 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100/30' 
                : 'bg-rose-50 text-rose-600 border-rose-100/30'
            }`}>
              {isInvestmentPositive ? '↑' : '↓'} {yieldPercentage.toFixed(2)}%
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-800 font-sans">
              {formatCurrency(totalCurrentValue)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              {isInvestmentPositive ? '+' : '-'}{formatCurrency(Math.abs(totalReturn))} de rendimiento neto
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default KPIOverview;

