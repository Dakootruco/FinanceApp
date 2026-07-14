import { useState } from 'react';
import {
  LineChart,
  Briefcase,
  Home,
  Zap,
  ShieldCheck,
  MinusCircle,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';

// Modales
import { InvestmentModal } from './components/InvestmentModal.jsx';
import { CapitalModal } from './components/CapitalModal.jsx';
import { PercentageModal } from './components/PercentageModal.jsx';

const CATEGORY_ICON_MAP = {
  Bolsa: LineChart,
  Cripto: Zap,
  'Bienes Raíces': Home,
  'Fondo Mutuo': Briefcase,
  'Renta Fija': ShieldCheck,
  Otros: MinusCircle
};

const CATEGORY_COLOR_MAP = {
  Bolsa: '#3b82f6', // Azul
  Cripto: '#f59e0b', // Ámbar
  'Bienes Raíces': '#10b981', // Esmeralda
  'Fondo Mutuo': '#8b5cf6', // Violeta
  'Renta Fija': '#06b6d4', // Cian
  Otros: '#6b7280' // Gris
};

export const InvestmentsPage = () => {
  const { investments, deleteInvestment } = useFinanceStore();

  // Control de Modales
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);

  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [investmentToAdjustCapital, setInvestmentToAdjustCapital] = useState(null);

  const [isPercentageModalOpen, setIsPercentageModalOpen] = useState(false);
  const [investmentToAdjustPercentage, setInvestmentToAdjustPercentage] = useState(null);

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // --- CÁLCULOS GLOBALES ---
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested || 0), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + parseFloat(inv.current_value || 0), 0);
  const totalReturn = investments.reduce((sum, inv) => sum + parseFloat(inv.net_return || 0), 0);

  // Porcentaje de rendimiento global
  const globalYield = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const isGlobalPositive = totalReturn >= 0;

  // --- ASIGNACIÓN DE PORTAFOLIO POR CATEGORÍA ---
  const categoryAllocation = investments.reduce((acc, inv) => {
    const cat = inv.category;
    const value = parseFloat(inv.current_value || 0);
    acc[cat] = (acc[cat] || 0) + value;
    return acc;
  }, {});

  const allocationList = Object.entries(categoryAllocation)
    .map(([category, value]) => {
      const percentage = totalCurrent > 0 ? Math.round((value / totalCurrent) * 100) : 0;
      return { category, value, percentage };
    })
    .sort((a, b) => b.value - a.value);

  // --- CONTROL DE ACCIONES ---
  const handleCreate = () => {
    setInvestmentToEdit(null);
    setIsInvestmentModalOpen(true);
  };

  const handleEdit = (inv) => {
    setInvestmentToEdit(inv);
    setIsInvestmentModalOpen(true);
  };

  const handleAdjustCapital = (inv) => {
    setInvestmentToAdjustCapital(inv);
    setIsCapitalModalOpen(true);
  };

  const handleAdjustPercentage = (inv) => {
    setInvestmentToAdjustPercentage(inv);
    setIsPercentageModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteInvestment(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LineChart className="text-indigo-400" size={24} />
            Portafolio de Inversiones
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Monitorea el valor actual, rentabilidad y distribución de tus activos financieros.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto flex justify-center">
          <Plus size={16} />
          Nueva Inversión
        </Button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* KPI: Total Capital Invertido */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capital Invertido</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(totalInvested)}
            </span>
          </CardContent>
        </Card>

        {/* KPI: Valor de Mercado Actual */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valor del Portafolio</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(totalCurrent)}
            </span>
          </CardContent>
        </Card>

        {/* KPI: Retorno Neto */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Retorno Neto Total</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-2xl font-black tracking-tight ${isGlobalPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isGlobalPositive ? '+' : ''}{formatCurrency(totalReturn)}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isGlobalPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' : 'bg-rose-50 text-rose-600 border border-rose-100/30'
                }`}>
                {isGlobalPositive ? '↑' : '↓'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI: Rendimiento Promedio */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rendimiento Promedio</span>
            <span className={`text-2xl font-black tracking-tight ${isGlobalPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isGlobalPositive ? '+' : ''}{globalYield.toFixed(2)}%
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Grid Principal: Listado (70%) vs Distribución (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Sección de Listado de Inversiones */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-400" />
            Tus Activos Financieros
          </h3>

          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3.5 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                <LineChart size={28} />
              </div>
              <div className="text-center flex flex-col gap-0.5 mt-1">
                <p className="font-bold text-sm text-slate-800">No hay inversiones registradas</p>
                <span className="text-xs text-slate-400 font-semibold">Agrega tus fondos, acciones o criptoactivos para comenzar.</span>
              </div>
              <Button variant="primary" onClick={handleCreate} className="mt-2">
                <Plus size={16} />
                Agregar Primera Inversión
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investments.map(inv => {
                const IconComponent = CATEGORY_ICON_MAP[inv.category] || MinusCircle;
                const catColor = CATEGORY_COLOR_MAP[inv.category] || '#6b7280';

                const returnVal = parseFloat(inv.net_return || 0);
                const isPositive = returnVal >= 0;
                const changePct = parseFloat(inv.change_percentage || 0);

                return (
                  <Card key={inv.id} className="!bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between h-[250px]">
                    <div className="flex flex-col gap-4">
                      {/* Cabecera del Activo */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${catColor}15`,
                              color: catColor
                            }}
                          >
                            <IconComponent size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 truncate max-w-[150px]" title={inv.name}>
                              {inv.name}
                            </h4>
                            <span
                              className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-opacity-10/20"
                              style={{
                                backgroundColor: `${catColor}10`,
                                color: catColor,
                                borderColor: `${catColor}20`
                              }}
                            >
                              {inv.category}
                            </span>
                          </div>
                        </div>

                        {/* Rendimiento Badge */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{isPositive ? '+' : ''}{changePct.toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Montos */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl p-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Capital Invertido</span>
                          <span className="font-extrabold text-slate-700 mt-0.5 block">
                            {formatCurrency(inv.amount_invested)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Valor Actual</span>
                          <span className="font-black text-slate-800 mt-0.5 block">
                            {formatCurrency(inv.current_value)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones y Retorno Neto */}
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Retorno</span>
                        <span className={`font-black text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(returnVal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustCapital(inv)}
                          className="py-1.5 px-2.5 rounded-lg text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer border border-indigo-100/20"
                          title="Inyectar o retirar capital"
                        >
                          Capital
                        </button>
                        <button
                          onClick={() => handleAdjustPercentage(inv)}
                          className="py-1.5 px-2.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all cursor-pointer"
                          title="Actualizar rentabilidad"
                        >
                          % Rend.
                        </button>
                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id, inv.name)}
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

        {/* Sección de Distribución del Portafolio */}
        <div className="flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <PieChart size={18} className="text-indigo-400" />
            Asignación de Activos
          </h3>

          <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col h-full justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asignación de Portafolio</span>

              {allocationList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs leading-relaxed">
                  No hay datos de asignación disponibles. Agrega activos para ver la distribución.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {allocationList.map(item => {
                    const catColor = CATEGORY_COLOR_MAP[item.category] || '#6b7280';
                    return (
                      <div key={item.category} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">{formatCurrency(item.value)}</span>
                            <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{item.percentage}%</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: catColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {investments.length > 0 && (
              <div className="border-t border-slate-50 pt-5 mt-6 flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span>Total de Activos:</span>
                <span className="font-bold text-slate-800">{investments.length}</span>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* MODALES DE GESTIÓN */}
      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => {
          setIsInvestmentModalOpen(false);
          setInvestmentToEdit(null);
        }}
        investmentToEdit={investmentToEdit}
      />

      <CapitalModal
        isOpen={isCapitalModalOpen}
        onClose={() => {
          setIsCapitalModalOpen(false);
          setInvestmentToAdjustCapital(null);
        }}
        investment={investmentToAdjustCapital}
      />

      <PercentageModal
        isOpen={isPercentageModalOpen}
        onClose={() => {
          setIsPercentageModalOpen(false);
          setInvestmentToAdjustPercentage(null);
        }}
        investment={investmentToAdjustPercentage}
      />

      <ConfirmModal 
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar inversión?"
        description={`¿Estás seguro de que deseas eliminar la inversión "${deleteTargetName}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};
export default InvestmentsPage;
