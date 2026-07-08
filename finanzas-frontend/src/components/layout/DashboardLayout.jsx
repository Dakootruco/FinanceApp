import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { TransactionModal } from '../shared/TransactionModal.jsx';
import { ImportStatementModal } from '../../features/transactions/components/ImportStatementModal.jsx';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f5f7] text-slate-800">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header superior */}
        <Header />

        {/* Contenido dinámico */}
        <main className="flex-grow overflow-y-auto bg-transparent">
          <div className="max-w-[1500px] mx-auto p-6 md:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Modal global de nueva transacción */}
      <TransactionModal />
      
      {/* Modal global de importación de estado de cuenta PDF */}
      <ImportStatementModal />
    </div>
  );
};
