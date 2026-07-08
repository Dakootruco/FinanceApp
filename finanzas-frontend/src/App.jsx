import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore.js';
import { supabase } from './services/supabase.js';
import { AuthPage } from './features/auth/AuthPage.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';
import { DashboardPage } from './features/dashboard/DashboardPage.jsx';
import { TransactionsPage } from './features/transactions/TransactionsPage.jsx';
import { BudgetsPage } from './features/budgets/BudgetsPage.jsx';
import { CategoriesPage } from './features/categories/CategoriesPage.jsx';
import { CreditCardsPage } from './features/credit-cards/CreditCardsPage.jsx';
import { BankAccountsPage } from './features/bank-accounts/BankAccountsPage.jsx';
import { InvestmentsPage } from './features/investments/InvestmentsPage.jsx';
import { SavingsGoalsPage } from './features/savings-goals/SavingsGoalsPage.jsx';
import { SubscriptionsPage } from './features/subscriptions/SubscriptionsPage.jsx';
import { ReportsPage } from './features/reports/ReportsPage.jsx';
import { SettingsPage } from './features/settings/SettingsPage.jsx';
import { Button } from './components/ui/Button.jsx';

function App() {
  const { 
    currentPage, 
    loading, 
    error, 
    apiOnline, 
    checkConnectionAndLoad,
    setUserName
  } = useFinanceStore();

  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.name) {
        setUserName(session.user.user_metadata.name);
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.name) {
        setUserName(session.user.user_metadata.name);
      }
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [setUserName]);

  // Cargar datos financieros solo cuando hay un usuario autenticado y conectado
  useEffect(() => {
    if (session) {
      checkConnectionAndLoad();
    }
  }, [session, checkConnectionAndLoad]);

  // Enrutador de páginas basado en el estado global de Zustand
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'credit-cards':
        return <CreditCardsPage />;
      case 'bank-accounts':
        return <BankAccountsPage />;
      case 'investments':
        return <InvestmentsPage />;
      case 'savings-goals':
        return <SavingsGoalsPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  // 1. Cargando Estado de Autenticación
  if (authChecking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f4f5f7] text-slate-800">
        <RefreshCw size={40} className="animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-bold text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  // 2. Si no hay sesión iniciada, mostrar Pantalla de Login/Registro
  if (!session) {
    return <AuthPage />;
  }

  // 3. Cargando Datos Financieros (después de autenticar)
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f4f5f7] text-slate-800">
        <RefreshCw size={40} className="animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-bold text-slate-500">Cargando tu panel de finanzas...</p>
      </div>
    );
  }

  // 4. Estado de Error de Red con el Servidor
  if (error || !apiOnline) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f4f5f7] px-6">
        <div className="bg-white border border-slate-100 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-2">Error de Conexión</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            {error || 'No pudimos conectarnos al servidor de la base de datos local. Por favor verifica que tu API Express esté corriendo.'}
          </p>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button 
              variant="primary" 
              onClick={checkConnectionAndLoad}
              className="w-full"
            >
              <RefreshCw size={14} />
              Reintentar Conexión
            </Button>
            <Button
              variant="secondary"
              onClick={() => supabase.auth.signOut()}
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Renderizado de la aplicación con Layout principal y página activa
  return (
    <DashboardLayout>
      {renderPage()}
    </DashboardLayout>
  );
}

export default App;
