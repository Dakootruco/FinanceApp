import { useState } from 'react';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { TransactionFilters } from './components/TransactionFilters.jsx';
import { TransactionTable } from './components/TransactionTable.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PurgeConfirmModal } from './components/PurgeConfirmModal.jsx';

export const TransactionsPage = () => {
  const { setImportModalOpen } = useFinanceStore();
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Encabezado de la página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="text-indigo-400" size={24} />
            Historial de Movimientos
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Revisa, filtra y gestiona todos tus registros de ingresos y gastos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="danger" 
            onClick={() => setIsPurgeModalOpen(true)}
          >
            <Trash2 size={16} />
            Borrar Datos
          </Button>

          <Button 
            variant="primary" 
            onClick={() => setImportModalOpen(true)}
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
