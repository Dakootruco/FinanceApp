import { useState } from 'react';
import { CreditCard, Plus, Edit3, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { CreditCardModal } from './components/CreditCardModal.jsx';

export const CreditCardsPage = () => {
  const { creditCards, deleteCreditCard } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);

  // --- CÁLCULOS GLOBALES ---
  const totalBalance = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);

  // --- CONTROL DE ACCIONES ---
  const handleCreate = () => {
    setCardToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (card) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la tarjeta "${name}"?`)) {
      await deleteCreditCard(id);
    }
  };

  // --- LOGOS DE MARCA ---
  const getBrandLogo = (brand) => {
    switch (brand) {
      case 'Visa':
        return (
          <span className="bg-[#0f172a]/40 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black text-emerald-400 tracking-wider">
            VISA
          </span>
        );
      case 'Mastercard':
        return (
          <span className="bg-[#0f172a]/40 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black text-[#72a5e4] tracking-wider">
            MC
          </span>
        );
      case 'American Express':
        return (
          <span className="bg-[#0f172a]/40 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black text-cyan-400 tracking-wider">
            AMEX
          </span>
        );
      default:
        return (
          <span className="bg-[#0f172a]/40 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-300 tracking-wider">
            OTRO
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-indigo-400" size={24} />
            Tarjetas de Crédito
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Administra tus plásticos de crédito, saldos y configura sus apariencias personalizadas.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} />
          Nueva Tarjeta
        </Button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KPI: Saldo Deudor Total */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deuda Total Acumulada</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {formatCurrency(totalBalance)}
            </span>
          </CardContent>
        </Card>

        {/* KPI: Tarjetas Activas */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col gap-1.5 p-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tarjetas de Crédito Activas</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {creditCards.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Listado de Tarjetas */}
      {creditCards.length === 0 ? (
        <div className="bg-white border border-slate-100 p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[300px] animate-fade-in">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm animate-pulse">
            <CreditCard size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No hay tarjetas registradas</h3>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mt-1 mx-auto leading-relaxed">
              Agrega tus tarjetas de crédito para visualizar tus deudas y configurar sus límites en el panel principal.
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate} className="mt-2">
            <Plus size={16} />
            Agregar Tarjeta de Crédito
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditCards.map((card) => {
            const brandLogo = getBrandLogo(card.brand);
            return (
              <div
                key={card.id}
                className="text-white p-6 rounded-3xl h-52 flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                style={{ backgroundColor: card.color_theme || '#121620' }}
              >
                {/* Capa de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                {/* Marca de agua al fondo */}
                <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.03] text-7xl font-extrabold select-none pointer-events-none uppercase">
                  {card.brand === 'Mastercard' ? 'MC' : card.brand === 'American Express' ? 'AMEX' : card.brand}
                </div>

                {/* Fila Superior: Banco, Nombre y Acciones */}
                <div className="flex justify-between items-start z-10 w-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{card.bank}</span>
                    <span className="text-xs font-extrabold text-white/90 mt-0.5">{card.card_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(card)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
                      title="Editar tarjeta"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(card.id, card.card_name)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-white/70 hover:text-rose-400 transition-all cursor-pointer"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Fila Central: Saldo */}
                <div className="flex flex-col z-10">
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Saldo deudor</span>
                  <span className="text-2xl font-black tracking-tight mt-0.5">{formatCurrency(card.balance)}</span>
                </div>

                {/* Fila Inferior: Logo de Marca y Dígitos */}
                <div className="flex justify-between items-center z-10 w-full border-t border-white/10 pt-3.5">
                  <div className="flex items-center gap-2">
                    {brandLogo}
                  </div>
                  <span className="text-xs font-mono text-white/60 tracking-wider">
                    •••• •••• •••• {card.last_digits}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear/Editar */}
      <CreditCardModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCardToEdit(null);
        }}
        cardToEdit={cardToEdit}
      />

    </div>
  );
};

export default CreditCardsPage;
