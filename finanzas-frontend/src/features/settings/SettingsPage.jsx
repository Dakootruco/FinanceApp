import { useState, useEffect } from 'react';
import { Settings, User, Wallet, Palette, AlertOctagon, Sun, Moon, Trash2, ShieldAlert } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../components/ui/Input.jsx';
import { PurgeConfirmModal } from '../transactions/components/PurgeConfirmModal.jsx';

export const SettingsPage = () => {
  const { 
    userName, 
    userCurrency, 
    userTheme, 
    setUserName, 
    setUserCurrency, 
    setUserTheme,
    showAlert
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'currency', 'appearance', 'danger'
  const [name, setName] = useState(userName);
  const [successMsg, setSuccessMsg] = useState('');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Campo requerido', 'El nombre no puede estar vacío.', 'info');
      return;
    }
    setUserName(name.trim());
    setSuccessMsg('¡Perfil actualizado con éxito!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Perfil de Usuario' },
    { id: 'currency', icon: Wallet, label: 'Preferencias de Moneda' },
    { id: 'appearance', icon: Palette, label: 'Tema y Apariencia' },
    { id: 'danger', icon: AlertOctagon, label: 'Zona de Peligro', isDanger: true }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Configuración General
          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100/30">
            Ajustes
          </span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Administración de tu cuenta de finanzas, preferencias regionales, apariencia y estado de datos.
        </p>
      </div>

      {/* Grid del Contenido de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* Columna Izquierda: Menú Lateral de Ajustes */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm flex flex-col gap-1.5 h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              let activeStyle = '';
              if (isActive) {
                activeStyle = item.isDanger 
                  ? 'border-rose-500 bg-rose-50/30 text-rose-700 font-bold' 
                  : 'border-indigo-500 bg-indigo-50/50 text-indigo-650 font-bold';
              } else {
                activeStyle = item.isDanger
                  ? 'border-transparent text-rose-500 hover:bg-rose-50/10'
                  : 'border-transparent text-slate-550 hover:text-slate-800 hover:bg-slate-50';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSuccessMsg(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold rounded-2xl transition-all border-l-4 ${activeStyle} cursor-pointer`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Contenido Activo */}
        <div className="lg:col-span-9">
          <Card className="!bg-white border border-slate-100 rounded-3xl shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="!border-none pb-0">
              
              {/* Contenido Perfil */}
              {activeTab === 'profile' && (
                <div>
                  <CardTitle className="text-slate-800">Detalles de Perfil</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Configura tu información personal de saludo.
                  </p>
                </div>
              )}

              {/* Contenido Moneda */}
              {activeTab === 'currency' && (
                <div>
                  <CardTitle className="text-slate-800">Moneda de la Plataforma</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Selecciona la divisa regional para todos tus reportes y balances.
                  </p>
                </div>
              )}

              {/* Contenido Apariencia */}
              {activeTab === 'appearance' && (
                <div>
                  <CardTitle className="text-slate-800">Tema Visual</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Elige el aspecto visual que mejor se adapte a tu entorno.
                  </p>
                </div>
              )}

              {/* Contenido Danger Zone */}
              {activeTab === 'danger' && (
                <div>
                  <CardTitle className="text-rose-600">Acciones de Borrado Críticas</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Gestiona la eliminación y purga de tu base de datos.
                  </p>
                </div>
              )}

            </CardHeader>
            
            <CardContent className="mt-6 flex-grow">
              
              {/* Formulario Perfil */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-lg">
                  {successMsg && (
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl animate-fade-in">
                      {successMsg}
                    </div>
                  )}
                  
                  <FormGroup label="Nombre de Usuario">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        type="text"
                        placeholder="Ej. Dakoo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="flex-grow"
                      />
                      <Button type="submit" variant="primary" className="!py-2.5 !px-6 shrink-0">
                        Guardar Cambios
                      </Button>
                    </div>
                  </FormGroup>
                </form>
              )}

              {/* Formulario Moneda */}
              {activeTab === 'currency' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                    {[
                      { code: 'USD', symbol: '$', label: 'Dólar (USD)' },
                      { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
                      { code: 'DOP', symbol: 'RD$', label: 'Peso Dom. (DOP)' },
                      { code: 'MXN', symbol: '$', label: 'Peso Mex. (MXN)' }
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => setUserCurrency(item.code)}
                        className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                          userCurrency === item.code 
                            ? 'border-indigo-500 bg-indigo-50/10 text-indigo-650 shadow-[0_0_15px_rgba(99,102,241,0.08)]' 
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/20 text-slate-600'
                        }`}
                      >
                        <span className="text-xl font-black tracking-tight">{item.symbol}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario Apariencia */}
              {activeTab === 'appearance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  {/* Tema Claro */}
                  <button
                    onClick={() => setUserTheme('light')}
                    className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      userTheme === 'light' 
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-650' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/20 text-slate-600'
                    }`}
                  >
                    <Sun size={24} className={userTheme === 'light' ? 'text-amber-500' : 'text-slate-400'} />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">Modo Claro</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Fondo blanco tradicional</span>
                    </div>
                  </button>

                  {/* Tema Oscuro */}
                  <button
                    onClick={() => setUserTheme('dark')}
                    className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      userTheme === 'dark' 
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-650' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/20 text-slate-600'
                    }`}
                  >
                    <Moon size={24} className={userTheme === 'dark' ? 'text-indigo-400' : 'text-slate-400'} />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">Modo Oscuro</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Fondo oscuro de bajo contraste</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Formulario Danger Zone */}
              {activeTab === 'danger' && (
                <div className="max-w-xl border border-rose-100 bg-rose-50/5 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">¿Estás seguro de continuar?</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
                        Cualquier acción en esta sección eliminará permanentemente la información financiera. Asegúrate de comprender los alcances de cada opción en el modal de confirmación.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-rose-100/50 my-2"></div>
                  
                  <Button 
                    variant="danger" 
                    onClick={() => setIsPurgeModalOpen(true)}
                    className="flex items-center justify-center gap-2 !py-3 !text-xs !rounded-xl"
                  >
                    <Trash2 size={16} />
                    Abrir Panel de Borrado de Datos
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Modal de Purga / Borrado de Datos */}
      <PurgeConfirmModal 
        isOpen={isPurgeModalOpen} 
        onClose={() => setIsPurgeModalOpen(false)} 
      />

    </div>
  );
};
export default SettingsPage;
