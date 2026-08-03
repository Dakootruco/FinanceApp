import { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Database, ListFilter } from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';

export const PurgeConfirmModal = ({ isOpen, onClose }) => {
  const { purgeAllTransactions, purgeAllData } = useFinanceStore();

  const [purgeType, setPurgeType] = useState('transactions'); // 'transactions' o 'all'
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPurgeType('transactions');
      setConfirmText('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetWord = purgeType === 'transactions' ? 'BORRAR MOVIMIENTOS' : 'BORRAR TODO';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmText.trim() !== targetWord) {
      setError(`Por favor, escribe exactamente "${targetWord}" para continuar.`);
      return;
    }

    setLoading(true);
    try {
      let success = false;
      if (purgeType === 'transactions') {
        success = await purgeAllTransactions();
      } else {
        success = await purgeAllData();
      }

      if (success) {
        onClose();
      } else {
        setError('Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de red al intentar borrar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-base">
                Zona de Peligro: Borrar Datos
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-[#94a3b8] font-semibold mt-0.5">
                Esta acción es destructiva e irreversible
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] transition-colors p-1 hover:bg-slate-100 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A] dark:bg-[#1C1D2A] rounded-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {error && (
            <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Opciones de Borrado */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-wider">
              Selecciona el alcance del borrado:
            </label>

            <div className="grid grid-cols-1 gap-3">
              {/* Opción 1: Solo movimientos */}
              <div
                onClick={() => { setPurgeType('transactions'); setConfirmText(''); setError(''); }}
                className={`border-2 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all ${purgeType === 'transactions'
                  ? 'border-rose-500 bg-rose-50/20'
                  : 'border-slate-100 dark:border-[rgba(255,255,255,0.07)] hover:border-slate-200 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]'
                  }`}
              >
                <div className={`p-2.5 rounded-xl self-start ${purgeType === 'transactions' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-[#1C1D2A] text-slate-500 dark:text-[#94a3b8]'
                  }`}>
                  <ListFilter size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-[#ffffff] text-sm">
                    Borrar solo movimientos (Transacciones)
                  </h4>
                  <p className="text-slate-400 dark:text-[#94a3b8] text-[11px] font-medium mt-1 leading-relaxed">
                    Se vaciará por completo tu historial de transacciones. Tus cuentas bancarias, presupuestos, inversiones y metas permanecerán, pero sus saldos/valores se actualizarán automáticamente.
                  </p>
                </div>
                <div className="self-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${purgeType === 'transactions' ? 'border-rose-500 bg-rose-500' : 'border-slate-300 dark:border-[rgba(255,255,255,0.07)]'
                    }`}>
                    {purgeType === 'transactions' && <div className="w-2 h-2 rounded-full bg-white dark:bg-[#12131A]" />}
                  </div>
                </div>
              </div>

              {/* Opción 2: Todo */}
              <div
                onClick={() => { setPurgeType('all'); setConfirmText(''); setError(''); }}
                className={`border-2 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all ${purgeType === 'all'
                  ? 'border-red-600 bg-red-50/10'
                  : 'border-slate-100 dark:border-[rgba(255,255,255,0.07)] hover:border-slate-200 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A]'
                  }`}
              >
                <div className={`p-2.5 rounded-xl self-start ${purgeType === 'all' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-[#1C1D2A] text-slate-500 dark:text-[#94a3b8]'
                  }`}>
                  <Database size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-[#ffffff] text-sm">
                    Borrar todos los datos (Reiniciar aplicación)
                  </h4>
                  <p className="text-slate-400 dark:text-[#94a3b8] text-[11px] font-medium mt-1 leading-relaxed">
                    Elimina absolutamente todo: transacciones, presupuestos, inversiones, cuentas bancarias, tarjetas de crédito y metas de ahorro. La aplicación se restablecerá a sus valores semilla iniciales.
                  </p>
                </div>
                <div className="self-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${purgeType === 'all' ? 'border-red-600 bg-red-600' : 'border-slate-300 dark:border-[rgba(255,255,255,0.07)]'
                    }`}>
                    {purgeType === 'all' && <div className="w-2 h-2 rounded-full bg-white dark:bg-[#12131A]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmación por Texto */}
          <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
            <p className="text-slate-600 dark:text-[#94a3b8] text-xs font-semibold leading-relaxed">
              Para confirmar que comprendes la gravedad de esta acción, escribe la siguiente frase en el campo de texto:
            </p>
            <div className="my-1.5 py-1 px-3 bg-slate-200 dark:bg-[#1C1D2A]/60 dark:bg-[#1C1D2A] rounded-lg select-all text-slate-800 dark:text-[#ffffff] font-extrabold text-xs text-center border border-slate-300/40 select-none">
              {targetWord}
            </div>

            <input
              type="text"
              className="w-full bg-white dark:bg-[#12131A] border border-slate-200 dark:border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 text-slate-800 dark:text-[#ffffff] text-sm font-semibold outline-none focus:border-rose-400 transition-all uppercase placeholder-slate-400"
              placeholder={`Escribe "${targetWord}" aquí`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={loading || confirmText.trim().toUpperCase() !== targetWord}
              className="flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              {loading ? 'Borrando...' : 'Confirmar Borrado'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PurgeConfirmModal;
