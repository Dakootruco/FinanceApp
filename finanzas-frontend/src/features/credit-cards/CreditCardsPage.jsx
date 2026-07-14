import { useState } from 'react';
import { CreditCard, Plus, Edit3, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { CreditCardModal } from './components/CreditCardModal.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';

export const CreditCardsPage = () => {
  const { creditCards, deleteCreditCard } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

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

  const handleDelete = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteCreditCard(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  // --- LOGOS DE MARCA ---
  const getBrandLogo = (brand) => {
    switch (brand) {
      case 'Visa':
        return (
          <svg viewBox="0 0 24 24" className="h-6 w-auto select-none text-white fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
          </svg>
        );
      case 'Mastercard':
        return (
          <svg viewBox="0 0 40 24" className="h-5.5 select-none shrink-0" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#eb001b" />
            <circle cx="28" cy="12" r="12" fill="#ff5f00" />
            <path d="M20,2.9 A12,12 0 0,0 20,21.1 A12,12 0 0,0 20,2.9 Z" fill="#f79e1b" />
          </svg>
        );
      case 'American Express':
        return (
          <span className="bg-[#0070d2] border border-white/10 px-2 py-0.5 rounded text-[8px] font-black text-white tracking-widest shrink-0">
            AMEX
          </span>
        );
      default:
        return (
          <span className="bg-white/10 border border-white/5 px-2 py-0.5 rounded text-[8px] font-black text-slate-200 tracking-wider shrink-0">
            {brand.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-indigo-400" size={24} />
            Mis Tarjetas de Crédito
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Administra tus plásticos de crédito, saldos y configura sus apariencias personalizadas.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto flex justify-center">
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
            
            // Expiración ficticia determinista en base al ID
            const mockMonth = String((card.id % 12) + 1).padStart(2, '0');
            const mockYear = String(28 + (card.id % 5));
            const expiryDate = `${mockMonth}/${mockYear}`;

            return (
              <div
                key={card.id}
                className="text-white p-6 rounded-3xl h-52 flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/5"
                style={{ backgroundColor: card.color_theme || '#121620' }}
              >
                {/* Capa de división curva bicolor como en la imagen */}
                <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-white/[0.04] rounded-l-full pointer-events-none" />
                <div className="absolute right-[-10%] top-[-20%] w-[60%] h-[140%] rounded-full bg-white/[0.02] blur-xl pointer-events-none" />

                {/* Fila Superior: Banco, Nombre y Acciones */}
                <div className="flex justify-between items-start z-10 w-full">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-tight text-white/95">{card.bank}</span>
                    <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider mt-0.5">{card.card_name}</span>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-white/90 transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Editar tarjeta"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id, card.card_name)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 border border-white/5 text-white/90 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Fila Central: Chip inteligente y Contactless en la izquierda, Saldo deudor en la derecha */}
                <div className="flex justify-between items-center z-10 w-full mt-2">
                  {/* Chip & Waves */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Chip dorado con relieve */}
                    <div className="w-10 h-7 rounded-lg bg-gradient-to-br from-[#e5c060] via-[#ffd97d] to-[#b39239] opacity-95 border border-white/15 relative p-1 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                      <div className="flex justify-between h-1.5">
                        <div className="w-2.5 h-full border-r border-b border-black/10" />
                        <div className="w-2.5 h-full border-l border-b border-black/10" />
                      </div>
                      <div className="w-full h-1 border-y border-black/10" />
                      <div className="flex justify-between h-1.5">
                        <div className="w-2.5 h-full border-r border-t border-black/10" />
                        <div className="w-2.5 h-full border-l border-t border-black/10" />
                      </div>
                    </div>

                    {/* Contactless waves SVG */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/60 rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      <path d="M16.24 16.24a6 6 0 0 0-8.49 0" />
                      <path d="M19.07 13.41a10 10 0 0 0-14.14 0" />
                    </svg>
                  </div>

                  {/* Saldo deudor en la derecha */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black tracking-tight text-white">{formatCurrency(card.balance)}</span>
                    <span className="text-[7px] text-white/45 font-bold uppercase tracking-widest mt-0.5">Saldo deudor</span>
                  </div>
                </div>

                {/* Número de tarjeta en el centro */}
                <div className="z-10 mt-1">
                  <span className="text-[15px] font-mono text-white/95 tracking-[0.2em] block leading-none">
                    ••••  ••••  ••••  {card.last_digits}
                  </span>
                </div>

                {/* Fila Inferior: Vencimiento y Marca */}
                <div className="flex justify-between items-end z-10 w-full border-t border-white/10 pt-3 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[6.5px] text-white/40 font-bold uppercase tracking-widest">Valid Thru</span>
                    <span className="text-[10px] font-semibold text-white/85 tracking-wide mt-0.5">Vence {expiryDate}</span>
                  </div>
                  <div className="flex items-center h-6">
                    {brandLogo}
                  </div>
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

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar tarjeta de crédito?"
        description={`¿Estás seguro de que deseas eliminar la tarjeta de crédito "${deleteTargetName}"?`}
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};

export default CreditCardsPage;
