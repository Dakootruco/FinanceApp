import { useState, useRef, useEffect } from 'react';
import { Trash2, Calendar, ChevronDown, MinusCircle } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../../components/ui/Table.jsx';
import { CategoryBadge } from '../../../components/shared/CategoryBadge.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate } from '../../../utils/formatDate.js';

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
        <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto animate-fade-in">
          {/* Opción Sin Categoría */}
          <button
            onClick={async () => {
              await changeTransactionCategory(tx.id, null);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MinusCircle size={14} className="text-slate-300" />
            <span>Sin Categoría</span>
          </button>

          {txCategories.length > 0 && <div className="border-t border-slate-50 my-1"></div>}

          {/* Listado de Categorías disponibles */}
          {txCategories.map(cat => (
            <button
              key={cat.id}
              onClick={async () => {
                await changeTransactionCategory(tx.id, cat.id);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[11px] font-bold transition-colors cursor-pointer ${
                tx.category_id === cat.id ? 'bg-indigo-50/40 text-indigo-600' : 'text-slate-650 hover:text-slate-800'
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

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      await deleteTransaction(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 bg-slate-50 border border-slate-100 rounded-2xl">
        <Calendar size={48} className="text-slate-400 animate-pulse" />
        <p className="font-semibold text-sm">No se encontraron movimientos.</p>
        <span className="text-xs text-slate-500">Prueba ajustando los filtros o registra uno nuevo.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-2">
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
              <TableCell className="font-bold text-slate-800">
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
              <TableCell className="text-slate-500 text-xs font-semibold">
                {tx.bank_account_name ? (
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-655 border border-slate-200/50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                      {tx.bank_account_digits}
                    </span>
                    <span className="truncate max-w-[120px] font-bold text-slate-600" title={tx.bank_account_name}>
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
              <TableCell className="text-slate-500 text-xs font-semibold">
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
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center justify-center"
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
  );
};
