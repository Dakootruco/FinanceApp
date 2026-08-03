import { useState, useRef, useEffect } from 'react';
import { Trash2, Calendar, ChevronDown, MinusCircle } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../../components/ui/Table.jsx';
import { CategoryBadge } from '../../../components/shared/CategoryBadge.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';
import { ConfirmModal } from '../../../components/ui/ConfirmModal.jsx';

// Subcomponente selector de categoría en línea
const CategorySelector = ({ tx, categories, changeTransactionCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const txCategories = categories.filter(c => c.type === tx.type);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 focus:outline-none cursor-pointer group transition-all"
        title="Haga clic para cambiar categoría"
      >
        <CategoryBadge
          icon={tx.category_icon}
          color={tx.category_color}
          name={tx.category_name || 'Sin Categoría'}
          className="group-hover:opacity-90 group-hover:scale-[1.01] transition-all"
        />
        <ChevronDown size={12} className="text-slate-400 dark:text-[#94a3b8] group-hover:text-slate-600 dark:text-[#94a3b8] transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto animate-fade-in">
          {/* Opción Sin Categoría */}
          <button
            onClick={async () => {
              await changeTransactionCategory(tx.id, null);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors cursor-pointer"
          >
            <MinusCircle size={14} className="text-slate-300" />
            <span>Sin Categoría</span>
          </button>

          {txCategories.length > 0 && <div className="border-t border-slate-50 dark:border-[rgba(255,255,255,0.07)] my-1"></div>}

          {/* Listado de Categorías disponibles */}
          {txCategories.map(cat => (
            <button
              key={cat.id}
              onClick={async () => {
                await changeTransactionCategory(tx.id, cat.id);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] flex items-center gap-2 text-[11px] font-bold transition-colors cursor-pointer ${tx.category_id === cat.id ? 'bg-indigo-50 dark:bg-[#FB00FF]/10/40 text-indigo-600 dark:text-[#FB00FF]' : 'text-slate-650 hover:text-slate-800 dark:text-[#ffffff] dark:hover:text-white dark:text-[#ffffff]'
                }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/5"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TransactionTable = () => {
  const { transactions, categories, changeTransactionCategory, deleteTransaction } = useFinanceStore();

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteTransaction(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-[#94a3b8] gap-3 bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl">
        <Calendar size={48} className="text-slate-400 dark:text-[#94a3b8] animate-pulse" />
        <p className="font-semibold text-sm">No se encontraron movimientos.</p>
        <span className="text-xs text-slate-500 dark:text-[#94a3b8]">Prueba ajustando los filtros o registra uno nuevo.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50 rounded-2xl p-2 md:p-3">
      {/* Vista de Escritorio: Tabla tradicional */}
      <div className="hidden md:block">
        <Table wrapperClassName="overflow-visible">
          <TableHead>
            <TableRow>
              <TableCell header>Descripción</TableCell>
              <TableCell header>Categoría</TableCell>
              <TableCell header>Cuenta</TableCell>
              <TableCell header>Fecha</TableCell>
              <TableCell header className="text-right">Monto</TableCell>
              <TableCell header className="text-center w-[80px]">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                {/* Descripción */}
                <TableCell className="font-bold text-slate-800 dark:text-[#ffffff]">
                  {tx.description}
                </TableCell>

                {/* Categoría (Editable en línea) */}
                <TableCell>
                  <CategorySelector
                    tx={tx}
                    categories={categories}
                    changeTransactionCategory={changeTransactionCategory}
                  />
                </TableCell>

                {/* Cuenta Bancaria */}
                <TableCell className="text-slate-500 dark:text-[#94a3b8] text-xs font-semibold">
                  {tx.bank_account_name ? (
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 dark:bg-[#1C1D2A] text-slate-655 border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                        {tx.bank_account_digits}
                      </span>
                      <span className="truncate max-w-[120px] font-bold text-slate-600 dark:text-[#94a3b8]" title={tx.bank_account_name}>
                        {tx.bank_account_name}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Efectivo
                    </span>
                  )}
                </TableCell>

                {/* Fecha */}
                <TableCell className="text-slate-500 dark:text-[#94a3b8] text-xs font-semibold">
                  {formatDate(tx.date)}
                </TableCell>

                {/* Monto */}
                <TableCell className={`text-right font-extrabold font-sans ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center justify-center"
                    title="Eliminar transacción"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil: Tarjetas responsivas de Movimientos */}
      <div className="block md:hidden space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div key={tx.id} className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)]/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              {/* Línea Superior: Descripción e Importe */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-bold text-slate-800 dark:text-[#ffffff] text-[13px] truncate">{tx.description}</span>
                  <span className="text-[10px] text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider">{formatDate(tx.date)}</span>
                </div>
                <span className={`font-extrabold text-sm shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>
              </div>

              {/* Línea Inferior: Categoría y Cuenta + Acciones */}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 dark:border-[rgba(255,255,255,0.07)] gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Selector de Categoría */}
                  <CategorySelector
                    tx={tx}
                    categories={categories}
                    changeTransactionCategory={changeTransactionCategory}
                  />

                  {/* Cuenta */}
                  {tx.bank_account_name ? (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C1D2A] text-slate-655 border border-slate-200 dark:border-[rgba(255,255,255,0.07)]/50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      <span className="truncate max-w-[80px]" title={tx.bank_account_name}>
                        {tx.bank_account_name}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Efectivo
                    </span>
                  )}
                </div>

                {/* Botón de Borrar */}
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="p-2 rounded-xl text-slate-400 dark:text-[#94a3b8] hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Eliminar transacción"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar movimiento?"
        description="¿Estás seguro de que deseas eliminar este registro de movimiento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};
