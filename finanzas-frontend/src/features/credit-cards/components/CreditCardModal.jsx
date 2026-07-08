import { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input, Select, FormGroup } from '../../../components/ui/Input.jsx';

const VALID_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Otro'];

const THEMES = [
  { name: 'Charcoal Dark', color: '#121620' },
  { name: 'Charcoal Blue', color: '#1b2535' },
  { name: 'Deep Emerald', color: '#112c24' },
  { name: 'Royal Purple', color: '#231735' },
  { name: 'Midnight Crimson', color: '#32141a' },
  { name: 'Deep Sea Blue', color: '#0f243b' }
];

export const CreditCardModal = ({ isOpen, onClose, cardToEdit = null }) => {
  const { addCreditCard, updateCreditCard } = useFinanceStore();

  const [form, setForm] = useState({
    card_name: '',
    bank: '',
    brand: 'Visa',
    last_digits: '',
    balance: '',
    color_theme: '#121620'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (cardToEdit) {
        setForm({
          card_name: cardToEdit.card_name,
          bank: cardToEdit.bank,
          brand: cardToEdit.brand,
          last_digits: cardToEdit.last_digits,
          balance: cardToEdit.balance.toString(),
          color_theme: cardToEdit.color_theme || '#121620'
        });
      } else {
        setForm({
          card_name: '',
          bank: '',
          brand: 'Visa',
          last_digits: '',
          balance: '',
          color_theme: '#121620'
        });
      }
      setError('');
    }
  }, [isOpen, cardToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.card_name.trim() || !form.bank.trim() || !form.brand || !form.last_digits) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (!VALID_BRANDS.includes(form.brand)) {
      setError('Selecciona una marca válida.');
      return;
    }

    const digitsRegex = /^\d{4}$/;
    if (!digitsRegex.test(form.last_digits)) {
      setError('Los últimos dígitos deben ser exactamente 4 números.');
      return;
    }

    const balanceValue = parseFloat(form.balance);
    if (isNaN(balanceValue)) {
      setError('El saldo debe ser un número válido.');
      return;
    }

    let success;
    if (cardToEdit) {
      success = await updateCreditCard(cardToEdit.id, {
        card_name: form.card_name.trim(),
        bank: form.bank.trim(),
        brand: form.brand,
        last_digits: form.last_digits,
        balance: balanceValue,
        color_theme: form.color_theme
      });
    } else {
      success = await addCreditCard({
        card_name: form.card_name.trim(),
        bank: form.bank.trim(),
        brand: form.brand,
        last_digits: form.last_digits,
        balance: balanceValue,
        color_theme: form.color_theme
      });
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-500" />
            {cardToEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta de Crédito'}
          </h3>
          <button 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Nombre de la tarjeta */}
          <FormGroup label="Nombre de la Tarjeta">
            <Input 
              type="text"
              placeholder="Ej. Freedom Unlimited"
              value={form.card_name}
              onChange={(e) => setForm(prev => ({ ...prev, card_name: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Banco Emisor */}
          <FormGroup label="Banco Emisor">
            <Input 
              type="text"
              placeholder="Ej. Chase"
              value={form.bank}
              onChange={(e) => setForm(prev => ({ ...prev, bank: e.target.value }))}
              required
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            {/* Marca */}
            <FormGroup label="Marca">
              <Select
                value={form.brand}
                onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                required
              >
                {VALID_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </FormGroup>

            {/* Últimos 4 dígitos */}
            <FormGroup label="Últimos 4 Dígitos">
              <Input 
                type="text"
                placeholder="Ej. 9967"
                maxLength={4}
                value={form.last_digits}
                onChange={(e) => setForm(prev => ({ ...prev, last_digits: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </FormGroup>
          </div>

          {/* Saldo / Valor */}
          <FormGroup label="Saldo / Valor Actual ($)">
            <Input 
              type="number"
              step="any"
              placeholder="Ej. 5000"
              value={form.balance}
              onChange={(e) => setForm(prev => ({ ...prev, balance: e.target.value }))}
              required
            />
          </FormGroup>

          {/* Tema de Color */}
          <FormGroup label="Tema de Color de la Tarjeta">
            <div className="flex flex-wrap gap-2.5 mt-1.5">
              {THEMES.map(theme => (
                <button
                  key={theme.color}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, color_theme: theme.color }))}
                  className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    form.color_theme === theme.color 
                      ? 'border-indigo-500 scale-105 shadow-md' 
                      : 'border-transparent hover:scale-102'
                  }`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.name}
                >
                  {form.color_theme === theme.color && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </FormGroup>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button 
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              {cardToEdit ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default CreditCardModal;
