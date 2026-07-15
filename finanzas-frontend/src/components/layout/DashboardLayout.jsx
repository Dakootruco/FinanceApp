import { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { TransactionModal } from '../shared/TransactionModal.jsx';
import { ImportStatementModal } from '../../features/transactions/components/ImportStatementModal.jsx';
import { useFinanceStore } from '../../store/useFinanceStore.js';

export const DashboardLayout = ({ children }) => {
  const { currentPage } = useFinanceStore();
  const mainRef = useRef(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Resetear el scroll del contenedor principal al cambiar de página
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsMobileOpen(false); // Cerrar sidebar en móvil al navegar
  }, [currentPage]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f5f7] text-slate-800">
      {/* Sidebar - Desktop: fijo, Móvil: drawer deslizable */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Panel principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header superior */}
        <Header onOpenMobile={() => setIsMobileOpen(true)} />

        {/* Contenido dinámico */}
        <main ref={mainRef} className="flex-grow overflow-y-auto bg-transparent">
          <div className="max-w-[1500px] mx-auto p-4 md:p-8 animate-fade-in">
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
