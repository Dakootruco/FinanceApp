import { useState } from 'react';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { TransactionFilters } from './components/TransactionFilters.jsx';
import { TransactionTable } from './components/TransactionTable.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PurgeConfirmModal } from './components/PurgeConfirmModal.jsx';

export const TransactionsPage = () => {
  const { setImportModalOpen, transactions } = useFinanceStore();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const totalCount = transactions.length;

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado de la página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            <ClipboardList className="text-indigo-400" size={24} className="shrink-0" />
            Historial de Movimientos
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Revisa, filtra y gestiona todos tus registros de ingresos y gastos.
          </p>
          <p className="text-xs text-slate-400 font-bold mt-1.5 animate-fade-in">
            Total de transacciones: <span className="text-indigo-600 font-extrabold">{totalCount}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <Button
            variant="danger"
            onClick={() => setIsPurgeModalOpen(true)}
            className="flex-grow sm:flex-grow-0"
          >
            <Trash2 size={16} />
            Borrar Datos
          </Button>

          <Button
            variant="primary"
            onClick={() => setImportModalOpen(true)}
            className="flex-grow sm:flex-grow-0"
          >
            <Plus size={16} />
            Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm">
        <CardHeader className="!border-none !pb-0 !mb-0">
          <CardTitle>Listado y Filtros</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          {/* Filtros */}
          <TransactionFilters />

          {/* Tabla de Movimientos */}
          <TransactionTable />
        </CardContent>
      </Card>

      {/* Modal de Confirmación de Borrado */}
      <PurgeConfirmModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
      />

    </div>
  );
};
export default TransactionsPage;
