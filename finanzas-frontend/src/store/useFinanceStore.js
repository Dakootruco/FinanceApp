import { create } from 'zustand';
import { transactionsService } from '../services/transactionsService.js';

// Aplicar tema inicial inmediatamente
const initialTheme = localStorage.getItem('user-theme') || 'light';
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useFinanceStore = create((set, get) => ({
  // Ajustes de Usuario
  userName: localStorage.getItem('user-name') || 'Dakoo',
  userUsername: localStorage.getItem('user-username') || '',
  userCurrency: localStorage.getItem('user-currency') || 'USD',
  userTheme: initialTheme,

  // Datos
  transactions: [],
  categories: [],
  budgets: [],
  investments: [],
  creditCards: [],
  savingsGoals: [],
  bankAccounts: [],
  dashboard: {
    summary: { totalIncome: 0, totalExpenses: 0, balance: 0 },
    expensesByCategory: [],
    monthlyHistory: []
  },
  reportsData: {
    summary: { totalIncome: 0, totalExpenses: 0, savings: 0, savingsRate: 0, avgDailySpend: 0, topCategory: { name: 'Ninguna', amount: 0 } },
    categories: [],
    monthly: [],
    paymentMethods: []
  },
  
  // Estado de la interfaz
  currentPage: 'dashboard',
  isTransactionModalOpen: false,
  isImportModalOpen: false,
  apiOnline: false,
  loading: true,
  error: null,
  
  // Alertas personalizadas globales
  alertOpen: false,
  alertConfig: { title: '', description: '', variant: 'error' },
  showAlert: (title, description = '', variant = 'error') => {
    let cleanDesc = description;
    
    // Filtro salvaguarda en frontend para traducir errores crudos de PostgreSQL
    if (description.includes('unique constraint') || description.includes('duplicate key') || description.includes('23505')) {
      if (description.includes('bank_accounts')) {
        cleanDesc = 'Ya existe una cuenta bancaria con este nombre. Por favor, elige un nombre único.';
      } else if (description.includes('categories')) {
        cleanDesc = 'Ya existe una categoría con este nombre. Por favor, elige un nombre único.';
      } else if (description.includes('credit_cards')) {
        cleanDesc = 'Ya existe una tarjeta de crédito con este nombre. Por favor, elige un nombre único.';
      } else if (description.includes('savings_goals')) {
        cleanDesc = 'Ya existe una meta de ahorro con este nombre. Por favor, elige un nombre único.';
      } else if (description.includes('budgets')) {
        cleanDesc = 'Ya tienes un presupuesto activo configurado para esta categoría.';
      } else {
        cleanDesc = 'Ya existe un registro con este nombre o valor duplicado. Por favor, especifica un nombre único.';
      }
    }
    
    set({ alertOpen: true, alertConfig: { title, description: cleanDesc, variant } });
  },
  hideAlert: () => set({ alertOpen: false }),
  
  // Filtros activos para la página de transacciones
  filters: {
    type: '',
    category_id: '',
    startDate: '',
    endDate: ''
  },

  // Navegación
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Control del modal de transacciones
  setTransactionModalOpen: (isOpen) => set({ isTransactionModalOpen: isOpen }),
  
  // Control del modal de importación de PDF
  setImportModalOpen: (isOpen) => set({ isImportModalOpen: isOpen }),

  setUserName: (name) => {
    localStorage.setItem('user-name', name);
    set({ userName: name });
  },
  
  setUserUsername: (username) => {
    localStorage.setItem('user-username', username);
    set({ userUsername: username });
  },
  
  setUserCurrency: (currency) => {
    localStorage.setItem('user-currency', currency);
    set({ userCurrency: currency });
  },
  
  setUserTheme: (theme) => {
    localStorage.setItem('user-theme', theme);
    set({ userTheme: theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Configurar filtros de transacciones
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    // Auto-recargar transacciones filtradas
    get().fetchTransactions();
  },

  resetFilters: () => {
    set({
      filters: { type: '', category_id: '', startDate: '', endDate: '' }
    });
    get().fetchTransactions();
  },

  // Acciones de Red
  checkConnectionAndLoad: async () => {
    set({ loading: true });
    try {
      // Intentar cargar categorías para diagnosticar la conexión
      const categories = await transactionsService.getCategories();
      set({ apiOnline: true, categories, error: null });
      
      // Cargar el resto de la aplicación
      await Promise.all([
        get().fetchDashboard(),
        get().fetchTransactions(),
        get().fetchBudgets(),
        get().fetchInvestments(),
        get().fetchCreditCards(),
        get().fetchSavingsGoals(),
        get().fetchBankAccounts(),
        get().fetchReportsData()
      ]);
    } catch {
      set({ 
        apiOnline: false, 
        error: 'No se pudo conectar al backend de Finanzas. Asegúrate de iniciar el servidor Express.' 
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await transactionsService.getCategories();
      set({ categories });
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  },

  fetchTransactions: async () => {
    try {
      const filters = get().filters;
      const transactions = await transactionsService.getTransactions(filters);
      set({ transactions });
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
    }
  },

  fetchDashboard: async () => {
    try {
      const dashboard = await transactionsService.getDashboardData();
      set({ dashboard });
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    }
  },

  // Mutaciones de datos
  addTransaction: async (txData) => {
    try {
      await transactionsService.createTransaction(txData);
      // Sincronizar todos los datos
      await Promise.all([
        get().fetchTransactions(),
        get().fetchDashboard(),
        get().fetchBankAccounts()
      ]);
      return true;
    } catch (err) {
      console.error('Error al registrar transacción:', err);
      get().showAlert('Error', err.message || 'Error al guardar la transacción');
      return false;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionsService.deleteTransaction(id);
      // Sincronizar todos los datos
      await Promise.all([
        get().fetchTransactions(),
        get().fetchDashboard(),
        get().fetchBankAccounts()
      ]);
      return true;
    } catch (err) {
      console.error('Error al eliminar transacción:', err);
      return false;
    }
  },

  purgeAllTransactions: async () => {
    try {
      await transactionsService.purgeAllTransactions();
      // Sincronizar todos los datos afectados
      await Promise.all([
        get().fetchTransactions(),
        get().fetchDashboard(),
        get().fetchBankAccounts(),
        get().fetchReportsData()
      ]);
      return true;
    } catch (err) {
      console.error('Error al purgar transacciones:', err);
      get().showAlert('Error', err.message || 'Error al eliminar todas las transacciones');
      return false;
    }
  },

  purgeAllData: async () => {
    try {
      await transactionsService.purgeAllData();
      // Recargar todo el estado de la aplicación
      await get().checkConnectionAndLoad();
      return true;
    } catch (err) {
      console.error('Error al purgar todos los datos:', err);
      get().showAlert('Error', err.message || 'Error al restablecer la aplicación');
      return false;
    }
  },

  changeTransactionCategory: async (id, categoryId) => {
    try {
      await transactionsService.updateTransactionCategory(id, categoryId);
      // Sincronizar todos los datos
      await Promise.all([
        get().fetchTransactions(),
        get().fetchDashboard(),
        get().fetchBankAccounts()
      ]);
      return true;
    } catch (err) {
      console.error('Error al cambiar categoría de la transacción:', err);
      get().showAlert('Error', err.message || 'Error al cambiar la categoría');
      return false;
    }
  },

  addCategory: async (catData) => {
    try {
      await transactionsService.createCategory(catData);
      await get().fetchCategories();
      return true;
    } catch (err) {
      console.error('Error al crear categoría:', err);
      get().showAlert('Error', err.message || 'Error al crear la categoría');
      return false;
    }
  },

  updateCategory: async (id, catData) => {
    try {
      await transactionsService.updateCategory(id, catData);
      await Promise.all([
        get().fetchCategories(),
        get().fetchDashboard(),
        get().fetchTransactions(),
        get().fetchBudgets()
      ]);
      return true;
    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      get().showAlert('Error', err.message || 'Error al actualizar la categoría');
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      await transactionsService.deleteCategory(id);
      await Promise.all([
        get().fetchCategories(),
        get().fetchDashboard(),
        get().fetchTransactions(),
        get().fetchBudgets()
      ]);
      return true;
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      return false;
    }
  },

  fetchBudgets: async () => {
    try {
      const budgets = await transactionsService.getBudgets();
      set({ budgets });
    } catch (err) {
      console.error('Error al cargar presupuestos:', err);
    }
  },

  saveBudget: async (budgetData) => {
    try {
      await transactionsService.saveBudget(budgetData);
      await get().fetchBudgets();
      return true;
    } catch (err) {
      console.error('Error al guardar presupuesto:', err);
      get().showAlert('Error', err.message || 'Error al guardar el presupuesto');
      return false;
    }
  },

  deleteBudget: async (id) => {
    try {
      await transactionsService.deleteBudget(id);
      await get().fetchBudgets();
      return true;
    } catch (err) {
      console.error('Error al eliminar presupuesto:', err);
      return false;
    }
  },

  fetchInvestments: async () => {
    try {
      const investments = await transactionsService.getInvestments();
      set({ investments });
    } catch (err) {
      console.error('Error al cargar inversiones:', err);
    }
  },

  addInvestment: async (invData) => {
    try {
      await transactionsService.createInvestment(invData);
      await Promise.all([
        get().fetchInvestments(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al crear inversión:', err);
      get().showAlert('Error', err.message || 'Error al crear la inversión');
      return false;
    }
  },

  updateInvestment: async (id, invData) => {
    try {
      await transactionsService.updateInvestment(id, invData);
      await Promise.all([
        get().fetchInvestments(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al actualizar inversión:', err);
      get().showAlert('Error', err.message || 'Error al actualizar la inversión');
      return false;
    }
  },

  deleteInvestment: async (id) => {
    try {
      await transactionsService.deleteInvestment(id);
      await Promise.all([
        get().fetchInvestments(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al eliminar inversión:', err);
      return false;
    }
  },

  adjustInvestmentAmount: async (id, amount) => {
    try {
      await transactionsService.adjustInvestmentAmount(id, amount);
      await Promise.all([
        get().fetchInvestments(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al ajustar capital de inversión:', err);
      get().showAlert('Error', err.message || 'Error al ajustar el capital');
      return false;
    }
  },

  adjustInvestmentPercentage: async (id, change_percentage) => {
    try {
      await transactionsService.adjustInvestmentPercentage(id, change_percentage);
      await Promise.all([
        get().fetchInvestments(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al ajustar rendimiento de inversión:', err);
      get().showAlert('Error', err.message || 'Error al ajustar el rendimiento');
      return false;
    }
  },

  fetchCreditCards: async () => {
    try {
      const creditCards = await transactionsService.getCreditCards();
      set({ creditCards });
    } catch (err) {
      console.error('Error al cargar tarjetas de crédito:', err);
    }
  },

  addCreditCard: async (cardData) => {
    try {
      await transactionsService.createCreditCard(cardData);
      await get().fetchCreditCards();
      return true;
    } catch (err) {
      console.error('Error al registrar tarjeta de crédito:', err);
      get().showAlert('Error', err.message || 'Error al crear la tarjeta de crédito');
      return false;
    }
  },

  updateCreditCard: async (id, cardData) => {
    try {
      await transactionsService.updateCreditCard(id, cardData);
      await get().fetchCreditCards();
      return true;
    } catch (err) {
      console.error('Error al actualizar tarjeta de crédito:', err);
      get().showAlert('Error', err.message || 'Error al actualizar la tarjeta de crédito');
      return false;
    }
  },

  deleteCreditCard: async (id) => {
    try {
      await transactionsService.deleteCreditCard(id);
      await get().fetchCreditCards();
      return true;
    } catch (err) {
      console.error('Error al eliminar tarjeta de crédito:', err);
      return false;
    }
  },

  fetchSavingsGoals: async () => {
    try {
      const savingsGoals = await transactionsService.getSavingsGoals();
      set({ savingsGoals });
    } catch (err) {
      console.error('Error al cargar planes de ahorro:', err);
    }
  },

  addSavingsGoal: async (goalData) => {
    try {
      await transactionsService.createSavingsGoal(goalData);
      await get().fetchSavingsGoals();
      return true;
    } catch (err) {
      console.error('Error al crear plan de ahorro:', err);
      get().showAlert('Error', err.message || 'Error al crear el plan de ahorro');
      return false;
    }
  },

  updateSavingsGoal: async (id, goalData) => {
    try {
      await transactionsService.updateSavingsGoal(id, goalData);
      await get().fetchSavingsGoals();
      return true;
    } catch (err) {
      console.error('Error al actualizar plan de ahorro:', err);
      get().showAlert('Error', err.message || 'Error al actualizar el plan de ahorro');
      return false;
    }
  },

  deleteSavingsGoal: async (id) => {
    try {
      await transactionsService.deleteSavingsGoal(id);
      await get().fetchSavingsGoals();
      return true;
    } catch (err) {
      console.error('Error al eliminar plan de ahorro:', err);
      return false;
    }
  },

  adjustSavingsGoalAmount: async (id, amount) => {
    try {
      await transactionsService.adjustSavingsGoalAmount(id, amount);
      await get().fetchSavingsGoals();
      return true;
    } catch (err) {
      console.error('Error al ajustar ahorro:', err);
      get().showAlert('Error', err.message || 'Error al ajustar el monto de ahorro');
      return false;
    }
  },

  importTransactionsFromPDF: async (file) => {
    try {
      const response = await transactionsService.importPDF(file);
      return response;
    } catch (err) {
      console.error('Error al importar PDF:', err);
      get().showAlert('Error', err.message || 'Error al procesar el archivo PDF');
      return null;
    }
  },

  saveBulkTransactions: async (transactionsList) => {
    try {
      const response = await transactionsService.bulkCreateTransactions(transactionsList);
      if (response && response.success) {
        // Recargar transacciones y métricas
        await Promise.all([
          get().fetchTransactions(),
          get().fetchDashboard(),
          get().fetchBankAccounts()
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al guardar transacciones en lote:', err);
      get().showAlert('Error', err.message || 'Error al guardar las transacciones');
      return false;
    }
  },

  fetchBankAccounts: async () => {
    try {
      const bankAccounts = await transactionsService.getBankAccounts();
      set({ bankAccounts });
    } catch (err) {
      console.error('Error al cargar cuentas bancarias:', err);
    }
  },

  addBankAccount: async (data) => {
    try {
      await transactionsService.createBankAccount(data);
      await get().fetchBankAccounts();
      return true;
    } catch (err) {
      console.error('Error al crear cuenta bancaria:', err);
      get().showAlert('Error', err.message || 'Error al crear la cuenta bancaria');
      return false;
    }
  },

  updateBankAccount: async (id, data) => {
    try {
      await transactionsService.updateBankAccount(id, data);
      await Promise.all([
        get().fetchBankAccounts(),
        get().fetchTransactions(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al actualizar cuenta bancaria:', err);
      get().showAlert('Error', err.message || 'Error al actualizar la cuenta bancaria');
      return false;
    }
  },

  deleteBankAccount: async (id) => {
    try {
      await transactionsService.deleteBankAccount(id);
      await Promise.all([
        get().fetchBankAccounts(),
        get().fetchTransactions(),
        get().fetchDashboard()
      ]);
      return true;
    } catch (err) {
      console.error('Error al eliminar cuenta bancaria:', err);
      return false;
    }
  },

  fetchReportsData: async (filters = {}) => {
    try {
      const data = await transactionsService.getReportData(filters);
      set({ reportsData: data });
    } catch (err) {
      console.error('Error al cargar datos de reportes:', err);
    }
  }
}));
