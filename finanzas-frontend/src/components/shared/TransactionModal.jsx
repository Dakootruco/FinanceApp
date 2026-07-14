import { useState, useEffect } from 'react';
import { Plus, X, PlusCircle } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Button } from '../ui/Button.jsx';
import { Input, Select, FormGroup } from '../ui/Input.jsx';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionModal = () => {
  const {
    isTransactionModalOpen,
    setTransactionModalOpen,
    categories,
    bankAccounts,
    addTransaction,
    addCategory,
    showAlert
  } = useFinanceStore();

  const [showAddCategory, setShowAddCategory] = useState(false);

  // Formulario de Transacción
  const [txForm, setTxForm] = useState({
    amount: '',
    description: '',
    type: 'expense',
    date: getLocalDateString(),
    category_id: '',
    bank_account_id: ''
  });

  // Formulario de Categoría
  const [catForm, setCatForm] = useState({
    name: '',
    type: 'expense',
    icon: 'minus-circle',
    color: '#6366f1'
  });

  // Resetear el formulario al abrir
  useEffect(() => {
    if (isTransactionModalOpen) {
      const defaultType = 'expense';
      const filteredCats = categories.filter(c => c.type === defaultType);
      const defaultBankId = '';

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTxForm({
        amount: '',
        description: '',
        type: defaultType,
        date: getLocalDateString(),
        category_id: filteredCats.length > 0 ? filteredCats[0].id.toString() : '',
        bank_account_id: defaultBankId
      });
      setShowAddCategory(false);
    }
  }, [isTransactionModalOpen, categories, bankAccounts]);

  if (!isTransactionModalOpen) return null;

  // Manejar cambio de tipo (Gasto / Ingreso)
  const handleTxTypeChange = (type) => {
    const filteredCats = categories.filter(c => c.type === type);
    setTxForm(prev => ({
      ...prev,
      type,
      category_id: filteredCats.length > 0 ? filteredCats[0].id.toString() : ''
    }));
  };

  // Guardar Transacción
  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.description || !txForm.category_id) {
      showAlert('Campos requeridos', 'Por favor completa todos los campos requeridos.', 'info');
      return;
    }

    const bankAccountId = (txForm.bank_account_id && txForm.bank_account_id !== 'efectivo')
      ? parseInt(txForm.bank_account_id, 10)
      : null;

    const success = await addTransaction({
      amount: parseFloat(txForm.amount),
      description: txForm.description,
      type: txForm.type,
      date: txForm.date,
      category_id: parseInt(txForm.category_id, 10),
      bank_account_id: bankAccountId
    });

    if (success) {
      setTransactionModalOpen(false);
    }
  };

  // Crear Categoría
  const handleCreateCategory = async () => {
    if (!catForm.name) {
      showAlert('Nombre requerido', 'El nombre de la categoría es obligatorio.', 'info');
      return;
    }

    const success = await addCategory({
      ...catForm,
      type: txForm.type // Asociar al tipo de transacción actual
    });

    if (success) {
      setCatForm({
        name: '',
        type: 'expense',
        icon: 'minus-circle',
        color: '#6366f1'
      });
      setShowAddCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Caja de Diálogo */}
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">

        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <PlusCircle size={18} className="text-indigo-500" />
            Registrar Movimiento
          </h3>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
            onClick={() => setTransactionModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmitTx} className="p-6 flex flex-col gap-4">

          {/* Tipo de Transacción */}
          <FormGroup label="Tipo">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                type="button"
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${txForm.type === 'expense' ? 'bg-white text-rose-600 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleTxTypeChange('expense')}
              >
                Gasto
              </button>
              <button
                type="button"
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${txForm.type === 'income' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleTxTypeChange('income')}
              >
                Ingreso
              </button>
            </div>
          </FormGroup>

          {/* Monto */}
          <FormGroup label="Monto ($)">
            <Input
              type="number"
              step="any"
              placeholder="Ej. 25000"
              value={txForm.amount}
              onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Descripción */}
          <FormGroup label="Descripción">
            <Input
              placeholder="Ej. Compra supermercado"
              value={txForm.description}
              onChange={(e) => setTxForm(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Fecha */}
          <FormGroup label="Fecha">
            <Input
              type="date"
              value={txForm.date}
              onChange={(e) => setTxForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Cuenta Bancaria */}
          <FormGroup label="Origen / Cuenta Bancaria">
            <Select
              value={txForm.bank_account_id}
              onChange={(e) => setTxForm(prev => ({ ...prev, bank_account_id: e.target.value }))}
            >
              <option value="">Efectivo (Movimiento Manual)</option>
              {bankAccounts
                .filter(acc => acc.name.toLowerCase() !== 'efectivo')
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (•••• {acc.last_digits})
                  </option>
                ))
              }
            </Select>
          </FormGroup>

          {/* Categoría */}
          <FormGroup>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</span>
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                onClick={() => setShowAddCategory(!showAddCategory)}
              >
                {showAddCategory ? 'Cancelar' : '+ Nueva'}
              </button>
            </div>

            {!showAddCategory ? (
              <Select
                value={txForm.category_id}
                onChange={(e) => setTxForm(prev => ({ ...prev, category_id: e.target.value }))}
                required
              >
                {categories
                  .filter(c => c.type === txForm.type)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </Select>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-indigo-200 flex flex-col gap-3 animate-fade-in">
                <Input
                  placeholder="Nombre de categoría"
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value, type: txForm.type }))}
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer bg-white p-1"
                    value={catForm.color}
                    onChange={(e) => setCatForm(prev => ({ ...prev, color: e.target.value }))}
                    title="Color"
                  />
                  <Select
                    value={catForm.icon}
                    onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="flex-grow"
                  >
                    <option value="shopping-bag">Bolsa / Compras</option>
                    <option value="truck">Transporte</option>
                    <option value="home">Hogar / Vivienda</option>
                    <option value="zap">Servicios / Energía</option>
                    <option value="heart">Salud</option>
                    <option value="film">Ocio / Cine</option>
                    <option value="book-open">Educación</option>
                    <option value="briefcase">Negocio / Trabajo</option>
                    <option value="trending-up">Inversión</option>
                    <option value="credit-card">Tarjeta / Banco</option>
                    <option value="minus-circle">Otros</option>
                  </Select>
                </div>
                <button
                  type="button"
                  className="bg-[#18191b] hover:bg-[#2b2d30] text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  onClick={handleCreateCategory}
                >
                  Crear e ingresar
                </button>
              </div>
            )}
          </FormGroup>

          {/* Botones de Envío */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant="secondary"
              onClick={() => setTransactionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              <Plus size={16} />
              Guardar
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
