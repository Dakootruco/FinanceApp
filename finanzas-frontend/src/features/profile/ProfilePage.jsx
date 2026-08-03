import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase.js';
import { useFinanceStore } from '../../store/useFinanceStore.js';
import { apiRequest } from '../../services/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, FormGroup } from '../../components/ui/Input.jsx';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  DollarSign, 
  Palette, 
  Edit3, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Wallet, 
  Target, 
  TrendingUp 
} from 'lucide-react';

export const ProfilePage = () => {
  const { 
    userName, 
    userUsername,
    userCurrency, 
    userTheme,
    setUserName,
    setUserUsername,
    transactions,
    bankAccounts,
    savingsGoals,
    budgets
  } = useFinanceStore();

  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [joinedDate, setJoinedDate] = useState('');

  // Estados de edición
  const [editName, setEditName] = useState(userName);
  const [editUsername, setEditUsername] = useState(userUsername);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Obtener datos del usuario desde Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
        if (user.created_at) {
          const date = new Date(user.created_at);
          setJoinedDate(date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
        }
      }
    });
  }, []);

  // Inicializar campos de edición al entrar en modo editar
  useEffect(() => {
    setEditName(userName);
    setEditUsername(userUsername);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  }, [isEditing, userName, userUsername]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Validaciones básicas
      if (!editName.trim()) {
        throw new Error('El nombre completo es obligatorio.');
      }
      if (!editUsername.trim()) {
        throw new Error('El nombre de usuario es obligatorio.');
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(editUsername.trim())) {
        throw new Error('El nombre de usuario debe tener entre 3 y 20 caracteres (solo letras, números y guion bajo).');
      }

      // Validar contraseñas si el usuario ingresó algo
      if (newPassword) {
        if (newPassword.length < 8) {
          throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
          throw new Error('La contraseña debe incluir mayúsculas, minúsculas y números.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas ingresadas no coinciden.');
        }
      }

      // 2. Actualizar metadatos en Supabase Auth
      const updatedMetadata = {
        name: editName.trim(),
        username: editUsername.trim().toLowerCase()
      };

      const { error: authError } = await supabase.auth.updateUser({
        data: updatedMetadata,
        ...(newPassword ? { password: newPassword } : {})
      });

      if (authError) throw authError;

      // 3. Sincronizar cambios con nuestra base de datos Express
      const response = await apiRequest('/profile/update', {
        method: 'PUT',
        body: JSON.stringify(updatedMetadata)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar perfil en el servidor.');
      }

      // 4. Actualizar store de Zustand
      setUserName(editName.trim());
      setUserUsername(editUsername.trim().toLowerCase());

      setSuccessMsg('¡Perfil actualizado correctamente!');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto w-full">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#ffffff] tracking-tight flex items-center gap-3">
          Mi Perfil de Usuario
          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100/30">
            Cuenta
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-semibold mt-1">
          Administra la información de tu cuenta, credenciales de acceso y visualiza tus estadísticas generales.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in font-semibold">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid del Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Columna Izquierda: Tarjeta de Avatar y Stats */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            {/* Avatar Círculo */}
            <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-slate-100 dark:border-[rgba(255,255,255,0.07)] relative group overflow-hidden">
              {userName ? userName.substring(0, 2).toUpperCase() : 'US'}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <User size={18} className="text-white" />
              </div>
            </div>

            {/* Nombre y Nombre de Usuario */}
            <div className="mt-4">
              <h3 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-lg leading-tight">{userName}</h3>
              <p className="text-slate-400 dark:text-[#94a3b8] text-xs font-bold mt-1">
                @{userUsername || 'sin_usuario'}
              </p>
            </div>

            {/* Divisor */}
            <div className="w-full border-t border-slate-100 dark:border-[rgba(255,255,255,0.07)]/80 my-5"></div>

            {/* Enlaces / Info Base */}
            <div className="w-full flex flex-col gap-3.5 text-left text-xs font-semibold text-slate-600 dark:text-[#94a3b8]">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-400 dark:text-[#94a3b8] shrink-0" />
                <span className="truncate" title={userEmail}>{userEmail || 'Cargando...'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={14} className="text-slate-400 dark:text-[#94a3b8] shrink-0" />
                <span>Miembro desde: {joinedDate || 'Cargando...'}</span>
              </div>
            </div>

            {/* Botón de alternancia a edición */}
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="primary" 
                className="w-full mt-6 flex items-center justify-center gap-2 !py-2.5 !text-xs !rounded-xl"
              >
                <Edit3 size={14} />
                Editar Perfil
              </Button>
            )}
          </Card>
        </div>

        {/* Columna Derecha: Detalles / Formulario */}
        <div className="md:col-span-8">
          
          {/* MODO EDICIÓN (FORMULARIO AJUSTES DE PERFIL) */}
          {isEditing ? (
            <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-base border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] pb-3 mb-5">
                  Ajustes de Perfil
                </h4>
                
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                  {/* Nombre y Nombre de Usuario */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormGroup label="Nombre Completo">
                      <Input 
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </FormGroup>
                    <FormGroup label="Nombre de Usuario (@)">
                      <Input 
                        type="text"
                        required
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Nombre de usuario único"
                      />
                    </FormGroup>
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-slate-100 dark:border-[rgba(255,255,255,0.07)] my-2"></div>
                  
                  {/* Sección Cambiar Contraseña */}
                  <div>
                    <h5 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-xs uppercase tracking-wider mb-3">
                      Cambiar Contraseña (Opcional)
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormGroup label="Nueva Contraseña">
                        <div className="relative">
                          <Input 
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8] hover:text-slate-650 outline-none cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </FormGroup>
                      
                      <FormGroup label="Confirmar Contraseña">
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8] hover:text-slate-650 outline-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </FormGroup>
                    </div>
                  </div>

                  {/* Acciones del formulario */}
                  <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-[rgba(255,255,255,0.07)] pt-5">
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      variant="secondary"
                      disabled={loading}
                      className="!py-2.5 !px-5 !text-xs !rounded-xl"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                      className="!py-2.5 !px-6 !text-xs !rounded-xl"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-6 h-full">
              {/* MODO LECTURA (INFORMACIÓN GENERAL Y ESTADÍSTICAS) */}
              {/* Tarjeta de Información General */}
              <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl p-6 shadow-sm">
                <h4 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-base border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] pb-3 mb-5">
                  Información General de la Cuenta
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold text-slate-600 dark:text-[#94a3b8]">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-[rgba(255,255,255,0.07)] pb-2">
                    <span className="text-slate-400 dark:text-[#94a3b8] flex items-center gap-2"><User size={13} /> Nombre Completo:</span>
                    <span className="text-slate-800 dark:text-[#ffffff] font-bold">{userName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-[rgba(255,255,255,0.07)] pb-2">
                    <span className="text-slate-400 dark:text-[#94a3b8] flex items-center gap-2"><User size={13} /> Nombre de Usuario:</span>
                    <span className="text-slate-800 dark:text-[#ffffff] font-bold">@{userUsername || 'No asignado'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-[rgba(255,255,255,0.07)] pb-2">
                    <span className="text-slate-400 dark:text-[#94a3b8] flex items-center gap-2"><Mail size={13} /> Correo Electrónico:</span>
                    <span className="text-slate-800 dark:text-[#ffffff] font-bold">{userEmail || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-[rgba(255,255,255,0.07)] pb-2">
                    <span className="text-slate-400 dark:text-[#94a3b8] flex items-center gap-2"><DollarSign size={13} /> Divisa Base:</span>
                    <span className="text-indigo-650 font-bold uppercase">{userCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-[rgba(255,255,255,0.07)] pb-2 sm:col-span-2">
                    <span className="text-slate-400 dark:text-[#94a3b8] flex items-center gap-2"><Palette size={13} /> Tema de Apariencia Activo:</span>
                    <span className="text-slate-800 dark:text-[#ffffff] font-bold capitalize">{userTheme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                  </div>
                </div>
              </Card>

              {/* Tarjeta de Estadísticas "Mis Números" */}
              <Card className="!bg-white dark:!bg-[#12131A] dark:bg-[#12131A] dark:!bg-[#12131A] dark:bg-[#12131A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] rounded-3xl p-6 shadow-sm flex-grow">
                <h4 className="font-extrabold text-slate-800 dark:text-[#ffffff] text-base border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] pb-3 mb-5 flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600 dark:text-[#FB00FF]" />
                  Resumen de mi Plataforma
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Transacciones */}
                  <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <TrendingUp size={20} className="text-emerald-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-[#ffffff]">{transactions.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] mt-1 uppercase">Movimientos</span>
                  </div>
                  {/* Cuentas Bancarias */}
                  <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Wallet size={20} className="text-blue-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-[#ffffff]">{bankAccounts.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] mt-1 uppercase">Cuentas</span>
                  </div>
                  {/* Presupuestos */}
                  <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Activity size={20} className="text-violet-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-[#ffffff]">{budgets.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] mt-1 uppercase">Presupuestos</span>
                  </div>
                  {/* Metas de Ahorro */}
                  <div className="bg-slate-50 dark:bg-[#1C1D2A] border border-slate-100 dark:border-[rgba(255,255,255,0.07)] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Target size={20} className="text-rose-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-[#ffffff]">{savingsGoals.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] mt-1 uppercase">Metas Ahorro</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default ProfilePage;
