import { useState } from 'react';
import { Landmark, Plus, Trash2, Edit3, X, CreditCard, PiggyBank, Receipt, Wallet } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../components/ui/Input.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

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

  // Calcular métricas consolidadas
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalAccountsCount = bankAccounts.length;

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setForm({
      name: '',
      bank_name: '',
      last_digits: '',
      balance: '0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setForm({
      name: acc.name,
      bank_name: acc.bank_name,
      last_digits: acc.last_digits,
      balance: acc.balance.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta bancaria? Las transacciones asociadas ya no mostrarán esta cuenta.')) {
      await deleteBankAccount(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.bank_name || !form.last_digits) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (!/^\d{4}$/.test(form.last_digits)) {
      alert('Los últimos dígitos deben ser exactamente 4 números.');
      return;
    }

    const data = {
      name: form.name,
      bank_name: form.bank_name,
      last_digits: form.last_digits,
      balance: parseFloat(form.balance || 0)
    };

    let success;
    if (editingAccount) {
      success = await updateBankAccount(editingAccount.id, data);
    } else {
      success = await addBankAccount(data);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Uniform premium obsidian card gradient class
  const cardGradientClass = 'from-[#1e293b] to-[#0f172a] shadow-[0_12px_25px_rgba(15,23,42,0.12)]';
  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="text-indigo-400" size={24} />
            Cuentas Bancarias
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Administra tus cuentas corrientes, de ahorros y otros fondos bancarios de forma segura.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          Registrar Cuenta
        </Button>
      </div>

      {/* Métricas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Consolidado en Bancos */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm md:col-span-2">
          <CardContent className="flex flex-col justify-between h-full gap-4">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Saldo Consolidado en Bancos
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {formatCurrency(totalBalance)}
              </span>
              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/30 px-1.5 py-0.5 rounded-full">
                Efectivo Disponible
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Suma agregada del saldo líquido disponible en todas tus cuentas de ahorro y corrientes.
            </p>
          </CardContent>
        </Card>

        {/* Cantidad de Cuentas */}
        <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm">
          <CardContent className="flex flex-col justify-between h-full gap-4">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Cuentas Registradas
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {totalAccountsCount}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Cuentas activas con las que puedes asociar estados de cuenta PDF y movimientos mensuales.
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Listado de Cuentas */}
      {bankAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3.5 bg-white border border-slate-100 rounded-3xl shadow-sm min-h-[320px]">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
            <Landmark size={28} />
          </div>
          <div className="text-center flex flex-col gap-0.5">
            <p className="font-bold text-sm text-slate-800">No hay cuentas bancarias registradas</p>
            <span className="text-xs text-slate-400 font-semibold leading-relaxed">
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
          {bankAccounts.map((acc, index) => {
            const isCash = acc.name.toLowerCase() === 'efectivo' || acc.bank_name.toLowerCase() === 'efectivo';
            const IconComponent = isCash ? Wallet : Landmark;

            return (
              <div
                key={acc.id}
                className={`rounded-3xl p-6 text-white bg-gradient-to-br relative overflow-hidden flex flex-col justify-between h-[210px] group transition-all duration-300 hover:-translate-y-1 ${cardGradientClass}`}
              >
                {/* Fondo semitransparente de textura */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
                
                {/* Cabecera de la tarjeta */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/50">
                      {isCash ? 'Efectivo' : acc.bank_name}
                    </span>
                    <span className="text-sm font-extrabold tracking-tight mt-0.5 max-w-[170px] truncate">
                      {acc.name}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                    <IconComponent size={20} className="text-white/95" />
                  </div>
                </div>

                {/* Número de Cuenta en el centro */}
                <div className="z-10 mt-3">
                  <span className="text-xs font-mono tracking-widest text-white/70 block">
                    {isCash ? 'Dinero en Efectivo' : `•••• •••• •••• ${acc.last_digits}`}
                  </span>
                </div>

                {/* Saldo y Acciones abajo */}
                <div className="flex justify-between items-end z-10 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/45">
                      Saldo Disponible
                    </span>
                    <span className="text-xl font-black font-sans tracking-tight leading-none mt-1">
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>

                  {/* Acciones flotantes en hover */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white/90 transition-all cursor-pointer"
                      title="Editar cuenta"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 border border-white/5 text-white/90 hover:text-white transition-all cursor-pointer"
                      title="Eliminar cuenta"
                    >
                      <Trash2 size={14} />
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
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Landmark size={18} className="text-indigo-500" />
                {editingAccount ? 'Editar Cuenta Bancaria' : 'Registrar Cuenta Bancaria'}
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
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
                <Input 
                  placeholder="Ej. Banco Popular Dominicano"
                  value={form.bank_name}
                  onChange={(e) => setForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  required
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                {/* Últimos 4 dígitos */}
                <FormGroup label="Últimos 4 dígitos *">
                  <Input 
                    placeholder="Ej. 1234"
                    maxLength={4}
                    value={form.last_digits}
                    onChange={(e) => setForm(prev => ({ ...prev, last_digits: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </FormGroup>

                {/* Saldo inicial (editable en creación) */}
                <FormGroup label="Saldo *">
                  <Input 
                    type="number"
                    step="any"
                    placeholder="Ej. 10000"
                    value={form.balance}
                    onChange={(e) => setForm(prev => ({ ...prev, balance: e.target.value }))}
                    required
                  />
                </FormGroup>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-4">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
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

    </div>
  );
};

export default BankAccountsPage;
