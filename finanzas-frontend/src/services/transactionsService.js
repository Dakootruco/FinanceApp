import { apiRequest } from './api.js';

export const transactionsService = {
  /**
   * Obtener transacciones filtradas.
   */
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return apiRequest(`/transactions${query ? `?${query}` : ''}`);
  },

  /**
   * Crear nueva transacción.
   */
  async createTransaction(data) {
    return apiRequest('/transactions', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Eliminar transacción.
   */
  async deleteTransaction(id) {
    return apiRequest(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Actualizar la categoría de una transacción.
   */
  async updateTransactionCategory(id, category_id) {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: { category_id }
    });
  },

  /**
   * Obtener categorías.
   */
  async getCategories() {
    return apiRequest('/categories');
  },

  /**
   * Crear una nueva categoría personalizada.
   */
  async createCategory(data) {
    return apiRequest('/categories', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Actualizar una categoría existente.
   */
  async updateCategory(id, data) {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  /**
   * Eliminar una categoría.
   */
  async deleteCategory(id) {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Obtener datos resumidos y agregados del dashboard.
   */
  async getDashboardData() {
    return apiRequest('/dashboard');
  },

  /**
   * Obtener todos los presupuestos configurados.
   */
  async getBudgets() {
    return apiRequest('/budgets');
  },

  /**
   * Registrar o actualizar el presupuesto de una categoría.
   */
  async saveBudget(data) {
    return apiRequest('/budgets', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Eliminar un presupuesto por su ID.
   */
  async deleteBudget(id) {
    return apiRequest(`/budgets/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Obtener todas las inversiones.
   */
  async getInvestments() {
    return apiRequest('/investments');
  },

  /**
   * Registrar una nueva inversión.
   */
  async createInvestment(data) {
    return apiRequest('/investments', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Actualizar una inversión existente.
   */
  async updateInvestment(id, data) {
    return apiRequest(`/investments/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  /**
   * Eliminar una inversión.
   */
  async deleteInvestment(id) {
    return apiRequest(`/investments/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Ajustar el monto capital invertido.
   */
  async adjustInvestmentAmount(id, amount) {
    return apiRequest(`/investments/${id}/adjust-amount`, {
      method: 'PATCH',
      body: { amount }
    });
  },

  /**
   * Ajustar el porcentaje de rendimiento.
   */
  async adjustInvestmentPercentage(id, change_percentage) {
    return apiRequest(`/investments/${id}/adjust-percentage`, {
      method: 'PATCH',
      body: { change_percentage }
    });
  },

  /**
   * Obtener todas las tarjetas de crédito.
   */
  async getCreditCards() {
    return apiRequest('/credit-cards');
  },

  /**
   * Registrar una nueva tarjeta de crédito.
   */
  async createCreditCard(data) {
    return apiRequest('/credit-cards', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Actualizar una tarjeta de crédito existente.
   */
  async updateCreditCard(id, data) {
    return apiRequest(`/credit-cards/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  /**
   * Eliminar una tarjeta de crédito.
   */
  async deleteCreditCard(id) {
    return apiRequest(`/credit-cards/${id}`, {
      method: 'DELETE'
    });
  },

  // ─── Savings Goals (Planes de Ahorro) ─────────────────

  /**
   * Obtener todos los objetivos de ahorro.
   */
  async getSavingsGoals() {
    return apiRequest('/savings-goals');
  },

  /**
   * Crear un nuevo objetivo de ahorro.
   */
  async createSavingsGoal(data) {
    return apiRequest('/savings-goals', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Actualizar un objetivo de ahorro existente.
   */
  async updateSavingsGoal(id, data) {
    return apiRequest(`/savings-goals/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  /**
   * Eliminar un objetivo de ahorro.
   */
  async deleteSavingsGoal(id) {
    return apiRequest(`/savings-goals/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Ajustar el monto ahorrado (aportar/retirar).
   */
  async adjustSavingsGoalAmount(id, amount) {
    return apiRequest(`/savings-goals/${id}/adjust-amount`, {
      method: 'PATCH',
      body: { amount }
    });
  },

  /**
   * Subir un PDF de estado de cuenta bancario para extraer transacciones.
   */
  async importPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/transactions-import/import-pdf', {
      method: 'POST',
      body: formData
    });
  },

  /**
   * Crear transacciones de forma masiva (en lote).
   */
  async bulkCreateTransactions(transactions) {
    return apiRequest('/transactions-import/bulk', {
      method: 'POST',
      body: { transactions }
    });
  },

  // ─── Bank Accounts (Cuentas Bancarias) ─────────────────

  /**
   * Obtener todas las cuentas bancarias.
   */
  async getBankAccounts() {
    return apiRequest('/bank-accounts');
  },

  /**
   * Registrar una nueva cuenta bancaria.
   */
  async createBankAccount(data) {
    return apiRequest('/bank-accounts', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Actualizar una cuenta bancaria existente.
   */
  async updateBankAccount(id, data) {
    return apiRequest(`/bank-accounts/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  /**
   * Eliminar una cuenta bancaria.
   */
  async deleteBankAccount(id) {
    return apiRequest(`/bank-accounts/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Obtener datos analíticos para los reportes avanzados.
   */
  async getReportData(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.bank_account_id) params.append('bank_account_id', filters.bank_account_id);

    const query = params.toString();
    return apiRequest(`/reports${query ? `?${query}` : ''}`);
  },

  /**
   * Eliminar todos los movimientos (transacciones).
   */
  async purgeAllTransactions() {
    return apiRequest('/transactions/purge/all', {
      method: 'DELETE'
    });
  },

  /**
   * Eliminar todos los datos y reiniciar la aplicación.
   */
  async purgeAllData() {
    return apiRequest('/transactions/purge/all-data', {
      method: 'DELETE'
    });
  }
};
