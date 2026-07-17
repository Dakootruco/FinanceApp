import { useState } from 'react';
import { supabase } from '../../services/supabase.js';
import { Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../assets/logo viatigo copia.png';

export const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isRegistering) {
        // Validar formato del correo
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
          throw new Error('El correo electrónico ingresado no tiene un formato válido.');
        }

        // Bloquear dominios de correo temporales o desechables comunes
        const disposableDomains = [
          'yopmail.com', 'mailinator.com', 'tempmail.com', 'guerrillamail.com', 
          'sharklasers.com', 'dispostable.com', 'getairmail.com', 'maildrop.cc', 
          '10minutemail.com', 'trashmail.com', 'yopmail.fr', 'yopmail.net'
        ];
        const emailDomain = email.trim().split('@')[1]?.toLowerCase();
        if (disposableDomains.includes(emailDomain)) {
          throw new Error('No se permiten correos electrónicos temporales o desechables.');
        }

        // Validar username
        if (!username.trim()) {
          throw new Error('El nombre de usuario es obligatorio.');
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
          throw new Error('El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números y guion bajo).');
        }

        // Validar requisitos de contraseña antes de registrar en Supabase
        const hasMinLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
          throw new Error('La contraseña no cumple con todos los requisitos de seguridad.');
        }

        // Registro de usuario en Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim(),
              username: username.trim().toLowerCase()
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setSuccessMsg('¡Registro exitoso! Hemos enviado un enlace de confirmación a tu correo. Por favor verifícalo antes de iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
        setUsername('');
        setEmail('');
      } else {
        // Iniciar sesión
        let loginEmail = emailOrUsername.trim();

        // Si no contiene '@', asumimos que es un username y resolvemos el email
        if (!loginEmail.includes('@')) {
          try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8180/api';
            const res = await fetch(`${apiBase}/auth/email-by-username/${encodeURIComponent(loginEmail)}`);
            if (!res.ok) {
              throw new Error('El nombre de usuario no existe.');
            }
            const data = await res.json();
            loginEmail = data.email;
          } catch (err) {
            throw new Error(err.message || 'Error al resolver el nombre de usuario.');
          }
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password
        });

        if (signInError) throw signInError;
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070b19] p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Luces de fondo difuminadas para aumentar estética Navy */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-fuchsia-950/20 blur-[140px] pointer-events-none"></div>

      {/* Card Principal (Más amplio y espacioso, cubriendo mayor porción de pantalla) */}
      <div className="w-full max-w-[1150px] min-h-[660px] md:h-[82vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-900/50 flex flex-col md:flex-row relative z-10 animate-fade-in">

        {/* LADO IZQUIERDO: Panel Navy de Presentación */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-b from-[#11162d] via-[#090b16] to-[#04050a] p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Brillo interior */}
          <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[90px]"></div>

          {/* Logo Principal e Icono */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center bg-[#121620]">
                <img
                  src={logoImg}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  style={{ transform: 'scale(1.42)' }}
                />
              </div>
              <span className="font-black text-3xl tracking-wide">
                Viati<span className="text-[#10b981]">Go</span>
              </span>
            </div>
          </div>

          {/* Slogan y Tarjeta Centrada */}
          <div className="flex flex-col items-center text-center my-auto px-4 relative z-10">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border border-white/5 mb-8 flex items-center justify-center bg-[#121620]/50 backdrop-blur-md">
              <img
                src={logoImg}
                alt="Logo"
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.42)' }}
              />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-4 leading-snug">
              Una plataforma para controlar tus gastos
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-[280px]">
              Controla tus cuentas bancarias, presupuestos y metas de ahorro en un solo lugar de forma simple y segura.
            </p>

            {/* Indicadores de slides ficticios de la imagen */}
            <div className="flex gap-2.5 mt-8">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
            </div>
          </div>

          {/* Footer del lado izquierdo */}
          <div className="text-[10px] text-slate-500 font-bold relative z-10">
            © {new Date().getFullYear()} ViatiGo. Todos los derechos reservados.
          </div>
        </div>

        {/* LADO DERECHO: Panel de Formulario */}
        <div className="w-full md:w-[58%] bg-white p-10 md:p-12 flex flex-col justify-between text-slate-800 overflow-y-auto">

          {/* Header Superior del Formulario */}
          <div className="flex items-center justify-between">
            {/* Logo para versión móvil (solo visible si el panel izquierdo está oculto) */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-[#121620]">
                <img
                  src={logoImg}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  style={{ transform: 'scale(1.42)' }}
                />
              </div>
              <span className="font-black text-sm tracking-wide">
                Viati<span className="text-[#10b981]">Go</span>
              </span>
            </div>
            <div className="hidden md:block"></div> {/* Espaciador */}

            {/* Link para cambiar modo */}
            <div className="text-xs font-bold text-slate-500">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setSuccessMsg(null);
                  setEmail('');
                  setUsername('');
                  setEmailOrUsername('');
                  setPassword('');
                }}
                className="ml-1 text-indigo-600 hover:text-indigo-755 font-black underline outline-none cursor-pointer"
              >
                {isRegistering ? 'Iniciar Sesión' : 'Regístrate'}
              </button>
            </div>
          </div>

          {/* Formulario e Introducción */}
          <div className="max-w-[420px] w-full mx-auto my-auto py-6">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {isRegistering ? 'Crea tu cuenta en ViatiGo' : '¡Bienvenido de nuevo!'}
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1.5">
                {isRegistering
                  ? 'Introduce tus datos para registrarte y empezar a gestionar tus finanzas.'
                  : 'Por favor introduce tus credenciales para acceder a tu panel.'}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-2.5 rounded-xl mb-5 flex items-start gap-2 animate-fade-in font-semibold">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs px-4 py-2.5 rounded-xl mb-5 flex items-start gap-2 animate-fade-in font-semibold">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* BOTONES DE INICIO DE SESIÓN SOCIAL (GOOGLE & APPLE) */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                type="button"
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs rounded-xl py-3 px-4 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15 0 12 0 7.35 0 3.37 2.67 1.48 6.56l3.89 3.02C6.29 6.82 8.94 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.37 14.42c-.24-.73-.38-1.5-.38-2.42s.14-1.69.38-2.42L1.48 6.56C.54 8.5.01 10.19.01 12s.53 3.5 1.47 5.44l3.89-3.02z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.73-2.89c-1.03.69-2.35 1.1-4.2 1.1-3.06 0-5.71-1.78-6.63-4.54L1.48 17.78C3.37 21.33 7.35 24 12 24z"
                  />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs rounded-xl py-3 px-4 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* SEPARADOR */}
            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200/80"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                Or sign in with
              </span>
              <div className="flex-grow border-t border-slate-200/80"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {isRegistering && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Nombre Completo</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={15} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Crea tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Nombre de Usuario</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={15} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Crea tu nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {isRegistering ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Crea tu correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Email o Usuario</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese su correo o usuario"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isRegistering ? "Crea tu contraseña" : "Ingrese su contraseña"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={(e) => {
                      if (e.relatedTarget && e.relatedTarget.id === 'password-toggle-btn') {
                        return;
                      }
                      setIsPasswordFocused(false);
                    }}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    id="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {isRegistering && isPasswordFocused && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-500 font-semibold flex flex-col gap-1.5 animate-fade-in">
                    <span className="font-extrabold text-slate-700">Requisitos de contraseña:</span>
                    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pl-1">
                      <li className={`flex items-center gap-1.5 transition-colors ${password.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        Mínimo 8 dígitos
                      </li>
                      <li className={`flex items-center gap-1.5 transition-colors ${/[A-Z]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        Una mayúscula
                      </li>
                      <li className={`flex items-center gap-1.5 transition-colors ${/[a-z]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        Una minúscula
                      </li>
                      <li className={`flex items-center gap-1.5 transition-colors ${/[0-9]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        Un número
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-[#18191b] hover:bg-[#2b2d30] text-white shadow-sm border border-slate-950/15 rounded-xl py-3 font-extrabold text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-center"
              >
                {loading ? 'Procesando...' : isRegistering ? 'Sign Up' : 'Sign In'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            {!isRegistering && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-xs font-bold text-slate-500 hover:underline outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Footer de Enlaces y Políticas */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-5 gap-2">
            <span className="md:hidden">© {new Date().getFullYear()} ViatiGo</span>
            <span className="hidden md:inline">© {new Date().getFullYear()} ViatiGo</span>
            <div className="flex gap-4">
              <button type="button" className="hover:text-slate-600 outline-none cursor-pointer">Privacy Policy</button>
              <button type="button" className="hover:text-slate-600 outline-none cursor-pointer">Support</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
