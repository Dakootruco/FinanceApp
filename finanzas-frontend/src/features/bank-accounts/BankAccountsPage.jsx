import { useState } from 'react';
import { Landmark, Plus, Trash2, Edit3, X, Wallet } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, FormGroup, Select } from '../../components/ui/Input.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { getBankStyles } from '../../utils/bankStyles.jsx';

export const BankAccountsPage = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bank_name: '',
    last_digits: '',
    balance: ''
  });

  const [error, setError] = useState(null);

  // Estados para ConfirmModal de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Calcular métricas consolidadas
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalAccountsCount = bankAccounts.length;

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setForm({
      name: '',
      bank_name: '',
      custom_bank_name: '',
      last_digits: '',
      balance: '0'
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    const standardBanks = ['Banreservas', 'Banco Popular Dominicano', 'Banco BHD', 'Qik Banco Digital', 'Efectivo'];
    const isStandard = standardBanks.includes(acc.bank_name);
    
    setForm({
      name: acc.name,
      bank_name: isStandard ? acc.bank_name : 'Otro',
      custom_bank_name: isStandard ? '' : acc.bank_name,
      last_digits: acc.last_digits,
      balance: acc.balance.toString()
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteBankAccount(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isOther = form.bank_name === 'Otro';
    const finalBankName = isOther ? form.custom_bank_name.trim() : form.bank_name.trim();

    const isCash = finalBankName.toLowerCase() === 'efectivo';
    const finalLastDigits = isCash ? '0000' : form.last_digits;

    if (!form.name || !finalBankName || (!isCash && !finalLastDigits)) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (!isCash && !/^\d{4}$/.test(finalLastDigits)) {
      setError('Los últimos dígitos deben ser exactamente 4 números.');
      return;
    }

    const data = {
      name: form.name,
      bank_name: finalBankName,
      last_digits: finalLastDigits,
      balance: parseFloat(form.balance || 0)
    };

    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, data);
      } else {
        await addBankAccount(data);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Error al guardar los datos.');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#ffffff] tracking-tight flex items-center gap-2.5">
            <Landmark className="text-indigo-400 dark:text-[#FB00FF]" size={24} />
            Cuentas de Banco
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold mt-1">
            Administra tus cuentas bancarias y balances iniciales para conciliar movimientos.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="w-full sm:w-auto flex justify-center">
          <Plus size={16} />
          Agregar Cuenta
        </Button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* KPI: Balance Total */}
        <Card className="md:col-span-2 !bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm">
          <CardContent className="flex flex-col justify-between h-full gap-4">
            <div className="text-slate-500 dark:text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
              Capital Neto Total
            </div>
            <div>
              <div className="text-3xl font-black text-slate-800 dark:text-[#ffffff] tracking-tight">
                {formatCurrency(totalBalance)}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider block mt-1">
                Efectivo Disponible
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-[#94a3b8] font-semibold leading-relaxed">
              Suma agregada del saldo líquido disponible en todas tus cuentas de ahorro y corrientes.
            </p>
          </CardContent>
        </Card>

        {/* Cantidad de Cuentas */}
        <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm">
          <CardContent className="flex flex-col justify-between h-full gap-4">
            <div className="text-slate-500 dark:text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
              Cuentas Registradas
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-[#ffffff] tracking-tight">
              {totalAccountsCount}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-[#94a3b8] font-semibold leading-relaxed">
              Cuentas activas con las que puedes asociar estados de cuenta PDF y movimientos mensuales.
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Listado de Cuentas */}
      {bankAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-[#94a3b8] gap-3.5 bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm min-h-[320px]">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-[#FB00FF]/10 text-indigo-500 dark:text-[#FB00FF] rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-[#FB00FF]/20 shadow-sm shrink-0">
            <Landmark size={28} />
          </div>
          <div className="text-center flex flex-col gap-0.5">
            <p className="font-bold text-sm text-slate-800 dark:text-[#ffffff]">No hay cuentas bancarias registradas</p>
            <span className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold leading-relaxed">
              Registra tu primera cuenta bancaria para organizar tus movimientos y balances.
            </span>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="mt-2">
            <Plus size={16} />
            Registrar Cuenta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((acc) => {
            const isCash = acc.name.toLowerCase() === 'efectivo' || acc.bank_name.toLowerCase() === 'efectivo';
            const { gradient, logo, tagColor } = getBankStyles(acc.bank_name);

            return (
              <div
                key={acc.id}
                className={`rounded-3xl p-6 text-white bg-gradient-to-br relative overflow-hidden flex flex-col justify-between aspect-[1.3/1] group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-white/10 ${gradient}`}
              >
                {/* Fondo semitransparente de textura */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

                {/* Cabecera de la tarjeta */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col gap-1">
                    {logo}
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/60 mt-1 truncate max-w-[150px]">
                      {isCash ? 'Efectivo' : acc.bank_name}
                    </span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${tagColor}`}>
                    {isCash ? 'CASH' : 'DEBIT'}
                  </span>
                </div>

                {/* Saldo disponible en el centro */}
                <div className="z-10 flex flex-col mt-4">
                  <span className="text-sm font-bold text-white/95 truncate max-w-[220px] tracking-wide" title={acc.name}>
                    {acc.name}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white/50 mt-0.5">
                    Saldo Disponible
                  </span>
                  <span className="text-2xl font-black font-sans tracking-tight leading-none mt-1.5">
                    {formatCurrency(acc.balance)}
                  </span>
                </div>

                {/* Cuenta y acciones en el pie */}
                <div className="flex justify-between items-center z-10 border-t border-white/10 pt-3">
                  <span className="text-[10px] font-mono tracking-widest text-white/70">
                    {isCash ? 'Dinero en Mano' : `•••• ${acc.last_digits}`}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg bg-white dark:bg-[#12131A]/10 hover:bg-white dark:bg-[#12131A] dark:hover:bg-[#1C1D2A]/20 border border-white/5 text-white/90 transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Editar cuenta"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id, acc.name)}
                      className="p-1.5 rounded-lg bg-white dark:bg-[#12131A]/10 hover:bg-rose-500/80 border border-white/5 text-white/90 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Eliminar cuenta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de CRUD de Cuentas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">

            {/* Cabecera */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]">
              <h3 className="font-bold text-slate-800 dark:text-[#ffffff] flex items-center gap-2">
                <Landmark size={18} className="text-indigo-500 dark:text-[#FB00FF]" />
                {editingAccount ? 'Editar Cuenta Bancaria' : 'Registrar Cuenta Bancaria'}
              </h3>
              <button
                className="text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors p-1 hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] rounded-lg cursor-pointer"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-3 py-2 rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
                  <span className="shrink-0 font-bold">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Nombre descriptivo */}
              <FormGroup label="Nombre de la cuenta *">
                <Input
                  placeholder="Ej. Cuenta de Ahorro Popular"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </FormGroup>

              {/* Nombre de la entidad bancaria */}
              <FormGroup label="Entidad Bancaria / Banco *">
                <Select
                  value={form.bank_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm(prev => ({
                      ...prev,
                      bank_name: val,
                      custom_bank_name: val === 'Otro' ? prev.custom_bank_name : ''
                    }));
                  }}
                  required
                >
                  <option value="" disabled>Selecciona un banco</option>
                  <option value="Banreservas">Banreservas</option>
                  <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
                  <option value="Banco BHD">Banco BHD</option>
                  <option value="Qik Banco Digital">Qik Banco Digital</option>
                  <option value="Efectivo">Efectivo (Efectivo / Caja)</option>
                  <option value="Otro">Otro (Especificar)</option>
                </Select>
              </FormGroup>

              {/* Input condicional para especificar otro banco */}
              {form.bank_name === 'Otro' && (
                <FormGroup label="Especifica el nombre del banco *">
                  <Input
                    placeholder="Ej. Banco BDI, Scotiabank, etc."
                    value={form.custom_bank_name}
                    onChange={(e) => setForm(prev => ({ ...prev, custom_bank_name: e.target.value }))}
                    required
                  />
                </FormGroup>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Últimos 4 dígitos */}
                {form.bank_name.trim().toLowerCase() !== 'efectivo' && (
                  <FormGroup label="Últimos 4 dígitos *">
                    <Input
                      placeholder="Ej. 1234"
                      maxLength={4}
                      value={form.last_digits}
                      onChange={(e) => setForm(prev => ({ ...prev, last_digits: e.target.value.replace(/\D/g, '') }))}
                      required
                    />
                  </FormGroup>
                )}

                {/* Saldo inicial (editable en creación) */}
                <FormGroup 
                  label={editingAccount ? "Saldo Actual (Solo Lectura)" : "Saldo Inicial *"}
                  className={form.bank_name.trim().toLowerCase() === 'efectivo' ? 'col-span-2' : ''}
                >
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej. 10000"
                    value={form.balance}
                    onChange={(e) => setForm(prev => ({ ...prev, balance: e.target.value }))}
                    required
                    disabled={!!editingAccount}
                  />
                </FormGroup>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 dark:border-[rgba(255,255,255,0.07)] pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingAccount ? 'Guardar Cambios' : 'Registrar Cuenta'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar cuenta bancaria?"
        description={`¿Estás seguro de que deseas eliminar la cuenta "${deleteTargetName}"? Las transacciones asociadas ya no mostrarán esta cuenta.`}
        confirmText="Eliminar"
        variant="danger"
      />

    </div>
  );
};

export default BankAccountsPage;
