import { useState } from 'react';
import { 
  User, 
  Wallet, 
  Palette, 
  AlertOctagon, 
  Sun, 
  Moon, 
  Trash2, 
  ShieldAlert, 
  Lock, 
  HelpCircle, 
  Info, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { supabase } from '../../services/supabase.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../components/ui/Input.jsx';
import { PurgeConfirmModal } from '../transactions/components/PurgeConfirmModal.jsx';
import { ProfilePage } from '../profile/ProfilePage.jsx';

export const SettingsPage = () => {
  const { 
    userCurrency, 
    userTheme, 
    setUserCurrency, 
    setUserTheme
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'currency', 'appearance', 'help', 'about', 'danger'
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Estados para Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Estado para FAQs interactivos en Centro de Ayuda
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  const menuItems = [
    { id: 'profile', icon: User, label: 'Perfil de Usuario' },
    { id: 'password', icon: Lock, label: 'Cambiar Contraseña' },
    { id: 'currency', icon: Wallet, label: 'Preferencias de Moneda' },
    { id: 'appearance', icon: Palette, label: 'Tema y Apariencia' },
    { id: 'help', icon: HelpCircle, label: 'Centro de Ayuda' },
    { id: 'about', icon: Info, label: 'Acerca de Viatigo' },
    { id: 'danger', icon: AlertOctagon, label: 'Zona de Peligro', isDanger: true }
  ];

  const faqs = [
    {
      q: '¿Cómo importo mis estados de cuenta bancarios?',
      a: 'Haz clic en el botón flotante "+" de la barra inferior, selecciona la cuenta bancaria de destino (Popular, Banreservas o BHD) y arrastra o busca tu archivo PDF. La plataforma extraerá y sugerirá categorías de forma automática.'
    },
    {
      q: '¿Qué formato de archivo de estado de cuenta es compatible?',
      a: 'Viatigo soporta archivos PDF digitales con texto seleccionable. Si tu PDF es escaneado (una foto o imagen sin texto seleccionable), el motor de procesamiento no podrá extraer los datos.'
    },
    {
      q: '¿Mis credenciales y movimientos están seguros?',
      a: 'Absolutamente. Todas las contraseñas e inicios de sesión se manejan directamente a través de Supabase Auth con encriptación robusta. Los datos viajan mediante conexiones seguras HTTPS/SSL y no se comparten con terceros.'
    },
    {
      q: '¿Cómo funcionan los presupuestos?',
      a: 'Puedes asignar un límite de gasto mensual para cada categoría en la sección correspondiente. La plataforma te avisará mediante barras visuales y alertas cuando te acerques al límite configurado.'
    }
  ];

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdSuccess('');
    setPwdError('');

    try {
      if (!currentPassword) {
        throw new Error('La contraseña actual es obligatoria.');
      }
      if (newPassword.length < 8) {
        throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
      }
      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        throw new Error('La contraseña debe incluir al menos una mayúscula, una minúscula y un número.');
      }
      if (newPassword === currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente de la actual.');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas ingresadas no coinciden.');
      }

      // 1. Obtener la sesión activa para extraer el email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('No se pudo verificar la sesión actual.');
      }

      // 2. Intentar iniciar sesión con la contraseña actual para verificarla
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (verifyError) {
        throw new Error('La contraseña actual ingresada es incorrecta.');
      }

      // 3. Proceder a actualizar la contraseña
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      setPwdSuccess('¡Contraseña actualizada correctamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setPwdLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#ffffff] tracking-tight flex items-center gap-3">
          Configuración General
          <span className="bg-indigo-50 dark:bg-[#FB00FF]/10 text-indigo-600 dark:text-[#FB00FF] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-[#FB00FF]/20/30">
            Ajustes
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold mt-1">
          Administración de tu cuenta de finanzas, preferencias regionales, apariencia y estado de datos.
        </p>
      </div>

      {/* Grid del Contenido de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* Columna Izquierda: Menú Lateral de Ajustes */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl p-3 shadow-sm flex flex-col gap-1.5 h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              let activeStyle = '';
              if (isActive) {
                activeStyle = item.isDanger 
                  ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold' 
                  : 'border-indigo-500 dark:border-[#FB00FF] bg-indigo-50 dark:bg-[#FB00FF]/15 text-indigo-700 dark:text-[#FB00FF] font-bold';
              } else {
                activeStyle = item.isDanger
                  ? 'border-transparent text-rose-500 hover:bg-rose-50/10 dark:hover:bg-rose-500/10'
                  : 'border-transparent text-slate-600 dark:text-[#94a3b8] hover:text-slate-800 dark:text-[#ffffff] dark:hover:text-[#ffffff] hover:bg-slate-50 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A]';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    setActiveTab(item.id); 
                    setPwdSuccess('');
                    setPwdError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
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
          {activeTab === 'profile' ? (
            <ProfilePage />
          ) : (
            <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl shadow-sm h-full flex flex-col justify-between">
              <CardHeader className="!border-none pb-0">
                
                {/* Contenido Cambiar Contraseña */}
                {activeTab === 'password' && (
                  <div>
                    <CardTitle className="text-slate-800 dark:text-[#ffffff]">Seguridad de la Cuenta</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Actualiza las credenciales de acceso para proteger tu información.
                    </p>
                  </div>
                )}

                {/* Contenido Moneda */}
                {activeTab === 'currency' && (
                  <div>
                    <CardTitle className="text-slate-800 dark:text-[#ffffff]">Moneda de la Plataforma</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Selecciona la divisa regional para todos tus reportes y balances.
                    </p>
                  </div>
                )}

                {/* Contenido Apariencia */}
                {activeTab === 'appearance' && (
                  <div>
                    <CardTitle className="text-slate-800 dark:text-[#ffffff]">Tema Visual</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Elige el aspecto visual que mejor se adapte a tu entorno.
                    </p>
                  </div>
                )}

                {/* Contenido Centro de Ayuda */}
                {activeTab === 'help' && (
                  <div>
                    <CardTitle className="text-slate-800 dark:text-[#ffffff]">Preguntas Frecuentes y Ayuda</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Resuelve dudas comunes sobre el funcionamiento de la plataforma.
                    </p>
                  </div>
                )}

                {/* Contenido Acerca de Viatigo */}
                {activeTab === 'about' && (
                  <div>
                    <CardTitle className="text-slate-800 dark:text-[#ffffff]">Acerca de la Aplicación</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Información técnica, versión y créditos de desarrollo.
                    </p>
                  </div>
                )}

                {/* Contenido Danger Zone */}
                {activeTab === 'danger' && (
                  <div>
                    <CardTitle className="text-rose-600">Acciones de Borrado Críticas</CardTitle>
                    <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-semibold mt-1">
                      Gestiona la eliminación y purga de tu base de datos.
                    </p>
                  </div>
                )}

              </CardHeader>
              
              <CardContent className="mt-6 flex-grow">
                
                {/* Formulario Cambiar Contraseña */}
                {activeTab === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 max-w-lg">
                    {pwdSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in font-semibold">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{pwdSuccess}</span>
                      </div>
                    )}

                    {pwdError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in font-semibold">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{pwdError}</span>
                      </div>
                    )}

                    <FormGroup label="Contraseña Actual">
                      <div className="relative">
                        <Input 
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8] hover:text-slate-650 outline-none cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup label="Nueva Contraseña">
                      <div className="relative">
                        <Input 
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres, incluye mayúsculas y números"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] outline-none cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup label="Confirmar Nueva Contraseña">
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite la contraseña exactamente"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8] hover:text-slate-600 dark:text-[#94a3b8] outline-none cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </FormGroup>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={pwdLoading}
                      className="!py-3 !px-6 w-full sm:w-auto self-start mt-2 !rounded-xl"
                    >
                      {pwdLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
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
                              ? 'border-indigo-500 dark:border-[#FB00FF] bg-indigo-50 dark:bg-[#FB00FF]/15 text-indigo-700 dark:text-[#FB00FF] shadow-[0_0_15px_rgba(99,102,241,0.08)] dark:shadow-[0_0_15px_rgba(251,0,255,0.15)]' 
                              : 'border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A] hover:border-slate-200 dark:hover:border-[rgba(255,255,255,0.12)] text-slate-600 dark:text-[#94a3b8] hover:text-slate-800 dark:hover:text-[#ffffff]'
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
                          ? 'border-indigo-500 dark:border-[#FB00FF] bg-indigo-50 dark:bg-[#FB00FF]/15 text-indigo-700 dark:text-[#FB00FF]' 
                          : 'border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A] text-slate-600 dark:text-[#94a3b8] hover:border-slate-200 dark:hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      <Sun size={24} className={userTheme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-[#94a3b8]'} />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">Modo Claro</span>
                        <span className="text-[9px] text-slate-400 dark:text-[#94a3b8] mt-0.5">Fondo blanco tradicional</span>
                      </div>
                    </button>

                    {/* Tema Oscuro */}
                    <button
                      onClick={() => setUserTheme('dark')}
                      className={`border-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                        userTheme === 'dark' 
                          ? 'border-indigo-500 dark:border-[#FB00FF] bg-indigo-50 dark:bg-[#FB00FF]/15 text-indigo-700 dark:text-[#FB00FF]' 
                          : 'border-slate-100 dark:border-[rgba(255,255,255,0.07)] bg-slate-50 dark:bg-[#1C1D2A] text-slate-600 dark:text-[#94a3b8] hover:border-slate-200 dark:hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      <Moon size={24} className={userTheme === 'dark' ? 'text-[#FB00FF]' : 'text-slate-400 dark:text-[#94a3b8]'} />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">Modo Oscuro</span>
                        <span className="text-[9px] text-slate-400 dark:text-[#94a3b8] mt-0.5">Fondo oscuro de bajo contraste</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Centro de Ayuda FAQ */}
                {activeTab === 'help' && (
                  <div className="flex flex-col gap-6 max-w-2xl">
                    <div className="flex flex-col gap-3">
                      {faqs.map((faq, index) => {
                        const isOpen = openFAQIndex === index;
                        return (
                          <div 
                            key={index} 
                            className="border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden transition-all bg-slate-50 dark:bg-[#1C1D2A]"
                          >
                            <button
                              onClick={() => toggleFAQ(index)}
                              className="w-full flex justify-between items-center px-5 py-4 text-xs font-bold text-slate-750 hover:bg-slate-50 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A]/40 text-left cursor-pointer transition-colors"
                            >
                              <span>{faq.q}</span>
                              {isOpen ? <ChevronUp size={16} className="text-slate-400 dark:text-[#94a3b8]" /> : <ChevronDown size={16} className="text-slate-400 dark:text-[#94a3b8]" />}
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-4 text-xs font-medium text-slate-500 dark:text-[#94a3b8] border-t border-slate-50 dark:border-[rgba(255,255,255,0.07)]/40 pt-3 leading-relaxed">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border border-[#FB00FF]/20 bg-[#FB00FF]/5 dark:bg-[#1C1D2A] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FB00FF]/10 flex items-center justify-center text-[#FB00FF] dark:text-[#FB00FF]">
                          <Mail size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-[#ffffff]">¿Aún necesitas ayuda?</h4>
                          <p className="text-[10px] text-slate-400 dark:text-[#94a3b8] font-semibold mt-0.5">Ponte en contacto con soporte técnico.</p>
                        </div>
                      </div>
                      <a 
                        href="mailto:soporte@viatigo.com?subject=Soporte%20Viatigo"
                        className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 dark:bg-[#FB00FF] hover:bg-indigo-700 dark:hover:bg-[#d900dc] transition-all text-center"
                      >
                        Enviar Correo
                      </a>
                    </div>
                  </div>
                )}

                {/* Acerca de Viatigo */}
                {activeTab === 'about' && (
                  <div className="flex flex-col gap-6 max-w-xl">
                    <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4 shadow-md">
                      {/* Decorative gradient sphere */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500 dark:bg-[#FB00FF]/20 rounded-full blur-2xl"></div>
                      
                      <div>
                        <span className="bg-indigo-500 dark:bg-[#FB00FF] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                          Viatigo App
                        </span>
                        <h4 className="text-2xl font-black tracking-tight mt-2.5">Viatigo Finanzas</h4>
                        <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                          Viatigo es tu centro de control financiero inteligente. Te permite consolidar tus cuentas bancarias, automatizar el análisis de tus gastos mediante la carga de estados de cuenta PDF, monitorear tus planes de ahorro y planificar de forma efectiva tu presupuesto mensual.
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-[10px] text-slate-400 dark:text-[#94a3b8] font-bold uppercase tracking-wider">
                        <div className="flex justify-between">
                          <span>Versión de la Plataforma:</span>
                          <span className="text-white normal-case">v1.2.0-stable (Release 2026)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de Licencia:</span>
                          <span className="text-white normal-case">Licencia Comercial Privada</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tecnologías Core:</span>
                          <span className="text-white normal-case">React, Express, PostgreSQL, Supabase</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 dark:text-[#94a3b8] font-semibold leading-relaxed">
                      © 2026 Viatigo Software Corporation. Todos los derechos reservados.{"\n"}
                      Desarrollado bajo estándares de seguridad informática y encriptación de datos bancarios.
                    </p>
                  </div>
                )}

                {/* Formulario Danger Zone */}
                {activeTab === 'danger' && (
                  <div className="max-w-xl border border-rose-100 bg-rose-50/5 rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-[#ffffff]">¿Estás seguro de continuar?</h4>
                        <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold mt-1 leading-relaxed">
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
          )}
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
