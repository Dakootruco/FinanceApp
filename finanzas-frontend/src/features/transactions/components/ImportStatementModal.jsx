import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Check, 
  Trash2, 
  AlertCircle, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Button } from '../../../components/ui/Button.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';

export const ImportStatementModal = () => {
  const { 
    isImportModalOpen, 
    setImportModalOpen,
    setTransactionModalOpen,
    categories,
    bankAccounts,
    importTransactionsFromPDF,
    saveBulkTransactions,
    setCurrentPage,
    showAlert
  } = useFinanceStore();

  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set()); // Índices de transacciones seleccionadas para importar
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');

  const fileInputRef = useRef(null);

  // Resetear estados al abrir/cerrar modal o cambios en bankAccounts
  useEffect(() => {
    if (isImportModalOpen) {
      setStep(1);
      setFile(null);
      setLoading(false);
      setError(null);
      setTransactions([]);
      setSelectedIds(new Set());
      
      const defaultBankId = bankAccounts.length > 0 ? bankAccounts[0].id.toString() : '';
      setSelectedBankAccountId(defaultBankId);
    }
  }, [isImportModalOpen, bankAccounts]);

  if (!isImportModalOpen) return null;

  // Filtrar categorías según tipo
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  // --- HANDLERS PASO 1 (UPLOAD) ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        await processFile(droppedFile);
      } else {
        setError('El archivo debe ser un formato PDF válido.');
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await processFile(selectedFile);
    }
  };

  const processFile = async (targetFile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await importTransactionsFromPDF(targetFile);
      if (data && data.success) {
        if (data.transactions && data.transactions.length > 0) {
          // Inyectar un id temporal local para manejo de estado
          const items = data.transactions.map((t, idx) => ({ ...t, localId: idx }));
          setTransactions(items);
          
          // Seleccionar todos por defecto
          setSelectedIds(new Set(items.map(item => item.localId)));
          setStep(2);
        } else {
          setError('No pudimos detectar movimientos en el estado de cuenta. Por favor verifica que el PDF no sea escaneado (debe contener texto seleccionable).');
          setFile(null);
        }
      } else {
        setError('Ocurrió un error al procesar el archivo. Por favor reintenta.');
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de procesamiento');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleOpenManual = () => {
    setImportModalOpen(false);
    setTransactionModalOpen(true);
  };

  // --- HANDLERS PASO 2 (PREVIEW) ---
  const handleToggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.localId)));
    }
  };

  const handleToggleSelectRow = (localId) => {
    const next = new Set(selectedIds);
    if (next.has(localId)) {
      next.delete(localId);
    } else {
      next.add(localId);
    }
    setSelectedIds(next);
  };

  const handleRowChange = (localId, field, value) => {
    setTransactions(prev => prev.map(t => {
      if (t.localId === localId) {
        const updated = { ...t, [field]: value };
        // Si cambia el tipo, restablecer o ajustar la categoría
        if (field === 'type') {
          const defaultCat = value === 'expense' 
            ? (expenseCategories[0]?.id || null)
            : (incomeCategories[0]?.id || null);
          updated.category_id = defaultCat;
        }
        return updated;
      }
      return t;
    }));
  };

  const handleRemoveRow = (localId) => {
    setTransactions(prev => prev.filter(t => t.localId !== localId));
    const next = new Set(selectedIds);
    next.delete(localId);
    setSelectedIds(next);
  };

  const handleConfirmImport = async () => {
    const listToImport = transactions.filter(t => selectedIds.has(t.localId));
    if (listToImport.length === 0) {
      showAlert('Selección requerida', 'Por favor selecciona al menos una transacción para importar.', 'info');
      return;
    }

    setLoading(true);
    try {
      // Remover ids locales e inyectar la cuenta bancaria seleccionada antes de enviar al servidor
      const cleanList = listToImport.map(({ localId, ...rest }) => ({
        ...rest,
        bank_account_id: selectedBankAccountId ? parseInt(selectedBankAccountId, 10) : null
      }));
      const success = await saveBulkTransactions(cleanList);
      if (success) {
        setImportModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de Importación', 'Error al importar las transacciones.');
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS PASO 2 ---
  const selectedTransactions = transactions.filter(t => selectedIds.has(t.localId));
  
  const isSelfTransfer = (tx) => {
    const desc = (tx.description || '').toLowerCase();
    const cat = categories.find(c => c.id === tx.category_id);
    const catName = cat ? cat.name.toLowerCase() : '';
    const keywords = ['propia', 'traspaso', 'pago tarjeta', 'tubancoap'];
    
    return keywords.some(kw => desc.includes(kw)) || keywords.some(kw => catName.includes(kw));
  };

  const totalExpenses = selectedTransactions
    .filter(t => t.type === 'expense' && !isSelfTransfer(t))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalIncomes = selectedTransactions
    .filter(t => t.type === 'income' && !isSelfTransfer(t))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const netBalance = totalIncomes - totalExpenses;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in">
      <div 
        className={`bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] w-full transition-all duration-300 ${
          step === 1 ? 'max-w-xl' : 'max-w-6xl'
        }`}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/20">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <FileText className="text-indigo-500" size={20} />
              {step === 1 ? 'Importar Estado de Cuenta' : 'Previsualizar Movimientos'}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {step === 1 
                ? 'Sube tu PDF bancario para procesar transacciones automáticamente' 
                : `Verifica y edita las transacciones detectadas antes de confirmarlas (${selectedIds.size} de ${transactions.length} seleccionadas)`}
            </p>
          </div>
          
          <button 
            onClick={() => setImportModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-grow overflow-y-auto p-6">
          {/* PASO 1: UPLOAD */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 flex gap-3 text-xs font-semibold items-start animate-shake">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {bankAccounts.length === 0 ? (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded-3xl p-6 flex flex-col gap-4 items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Se requiere cuenta bancaria</h4>
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mt-1 leading-relaxed">
                      Primero debes registrar al menos una Cuenta Bancaria en la sección de bancos para poder importar tus estados de cuenta PDF.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImportModalOpen(false);
                      setCurrentPage('bank-accounts');
                    }}
                    className="py-2.5 px-5 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transition-all cursor-pointer"
                  >
                    Ir a Cuentas Bancarias
                  </button>
                </div>
              ) : (
                <>
                  {/* Selector de Cuenta Destino */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cuenta Bancaria de Destino *
                    </label>
                    <select
                      value={selectedBankAccountId}
                      onChange={(e) => setSelectedBankAccountId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 font-bold text-slate-700 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                    >
                      <option value="" disabled>Selecciona una cuenta bancaria...</option>
                      {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bank_name} - •••• {acc.last_digits})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Los movimientos extraídos del PDF se registrarán y sumarán al saldo de la cuenta elegida.
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                      <div className="relative flex items-center justify-center">
                        <Loader2 size={48} className="animate-spin text-indigo-600" />
                        <UploadCloud size={20} className="text-indigo-400 absolute" />
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="font-extrabold text-sm text-slate-800">Procesando estado de cuenta...</p>
                        <span className="text-[11px] text-slate-400 font-bold">Extrayendo y estructurando transacciones del PDF bancario.</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center text-center cursor-pointer transition-all gap-4 select-none ${
                        isDragActive 
                          ? 'border-indigo-500 bg-indigo-50/25 scale-[0.99] shadow-inner' 
                          : 'border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50/70'
                      }`}
                      onClick={handleButtonClick}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />

                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                        <UploadCloud size={30} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <h4 className="font-extrabold text-sm text-slate-800">Arrastra tu archivo aquí o búscalo</h4>
                        <span className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Soporta estados de cuenta, cartolas o cartolas históricas en formato PDF (Max. 5MB)
                        </span>
                      </div>

                      <Button variant="secondary" className="mt-1" onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}>
                        Seleccionar Archivo
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Botón de Carga Manual Alternativo */}
              {!loading && (
                <div className="border-t border-slate-100 pt-6 mt-2 flex flex-col items-center text-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Método Alternativo</span>
                  <button 
                    onClick={handleOpenManual}
                    className="mt-1 py-2 px-5 rounded-2xl text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition-all cursor-pointer border border-indigo-100/30"
                  >
                    Agregar movimiento de forma manual
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: PREVIEW & EDIT */}
          {step === 2 && (
            <div className="flex flex-col gap-6 h-full">
              
              {/* Tarjetas KPI de Resumen de Carga */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Movimientos totales */}
                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Transacciones a Importar</span>
                  <span className="text-lg font-black text-slate-800">{selectedIds.size} / {transactions.length}</span>
                </div>

                {/* Total Ingresos */}
                <div className="bg-emerald-50/20 border border-emerald-100/40 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Total Ingresos</span>
                  <span className="text-lg font-black text-emerald-600 flex items-center gap-1">
                    <TrendingUp size={16} />
                    {formatCurrency(totalIncomes)}
                  </span>
                </div>

                {/* Total Gastos */}
                <div className="bg-rose-50/20 border border-rose-100/40 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">Total Gastos</span>
                  <span className="text-lg font-black text-rose-600 flex items-center gap-1">
                    <TrendingDown size={16} />
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>

                {/* Balance Neto */}
                <div className={`border rounded-2xl p-4 flex flex-col gap-1 ${
                  netBalance >= 0 
                    ? 'bg-indigo-50/20 border-indigo-100/40 text-indigo-600' 
                    : 'bg-amber-50/25 border-amber-100/30 text-amber-700'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Balance del Periodo</span>
                  <span className="text-lg font-black flex items-center gap-1">
                    {formatCurrency(netBalance)}
                  </span>
                </div>

              </div>

              {/* Contenedor de la Tabla */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[50vh]">
                <div className="overflow-y-auto flex-grow">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold sticky top-0 z-10">
                        <th className="py-3 px-4 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.size === transactions.length && transactions.length > 0}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3 w-32">Fecha</th>
                        <th className="py-3 px-3">Descripción</th>
                        <th className="py-3 px-3 w-36">Tipo</th>
                        <th className="py-3 px-3 w-44">Monto ($)</th>
                        <th className="py-3 px-3 w-48">Categoría</th>
                        <th className="py-3 px-3 w-12 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map(t => {
                        const isSelected = selectedIds.has(t.localId);
                        const isExpense = t.type === 'expense';
                        
                        return (
                          <tr 
                            key={t.localId} 
                            className={`hover:bg-slate-50/50 transition-colors ${
                              !isSelected ? 'opacity-50 bg-slate-50/10' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => handleToggleSelectRow(t.localId)}
                                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Fecha */}
                            <td className="py-3 px-2">
                              <div className="relative flex items-center">
                                <Calendar size={12} className="absolute left-2.5 text-slate-400" />
                                <input 
                                  type="date" 
                                  value={t.date}
                                  onChange={(e) => handleRowChange(t.localId, 'date', e.target.value)}
                                  disabled={!isSelected}
                                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-1.5 pl-7 pr-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-[11px]"
                                />
                              </div>
                            </td>

                            {/* Descripción */}
                            <td className="py-3 px-2">
                              <input 
                                type="text" 
                                value={t.description}
                                onChange={(e) => handleRowChange(t.localId, 'description', e.target.value)}
                                disabled={!isSelected}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-1.5 px-3 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50 truncate"
                              />
                            </td>

                            {/* Tipo (Toggle Button) */}
                            <td className="py-3 px-2">
                              <div className="flex rounded-xl bg-slate-100/80 p-0.5 w-full border border-slate-200/40">
                                <button
                                  type="button"
                                  disabled={!isSelected}
                                  onClick={() => handleRowChange(t.localId, 'type', 'expense')}
                                  className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all text-[10px] cursor-pointer ${
                                    isExpense && isSelected
                                      ? 'bg-white text-rose-600 shadow-sm' 
                                      : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  Gasto
                                </button>
                                <button
                                  type="button"
                                  disabled={!isSelected}
                                  onClick={() => handleRowChange(t.localId, 'type', 'income')}
                                  className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all text-[10px] cursor-pointer ${
                                    !isExpense && isSelected
                                      ? 'bg-white text-emerald-600 shadow-sm' 
                                      : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  Ingreso
                                </button>
                              </div>
                            </td>

                            {/* Monto */}
                            <td className="py-3 px-2">
                              <div className="relative flex items-center">
                                <DollarSign size={12} className="absolute left-2.5 text-slate-400" />
                                <input 
                                  type="number" 
                                  min="0"
                                  step="any"
                                  value={t.amount}
                                  onChange={(e) => handleRowChange(t.localId, 'amount', e.target.value)}
                                  disabled={!isSelected}
                                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-1.5 pl-6 pr-2 font-bold text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-[11px]"
                                />
                              </div>
                            </td>

                            {/* Categoría */}
                            <td className="py-3 px-2">
                              <select
                                value={t.category_id || ''}
                                onChange={(e) => handleRowChange(t.localId, 'category_id', e.target.value ? parseInt(e.target.value, 10) : null)}
                                disabled={!isSelected}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-1.5 px-2.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-[11px] cursor-pointer"
                              >
                                <option value="">Sin Categoría</option>
                                {(isExpense ? expenseCategories : incomeCategories).map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* Quitar */}
                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(t.localId)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Descartar de esta importación"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Volver a Cargar
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setImportModalOpen(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Confirmar e Importar ({selectedIds.size} Movs)
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ImportStatementModal;
