import { useState } from 'react';
import { supabase } from '../../services/supabase.js';
import { Mail, Lock, User, TrendingUp, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isRegistering) {
        // Registro de usuario en Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setSuccessMsg('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
      } else {
        // Inicio de sesión
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#0f172a] via-[#1e1b4b] to-[#311042] p-4 relative overflow-hidden font-sans">
      {/* Elementos decorativos de fondo difuminados */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-[450px] relative z-10">
        {/* Logo / Encabezado de la App */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center animate-fade-in">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/10">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">App Finanzas</h1>
            <p className="text-slate-400 text-sm mt-1">Controla tus gastos de manera inteligente y segura</p>
          </div>
        </div>

        {/* Tarjeta de Formulario (Glassmorphism) */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"></div>

          <h2 className="text-xl font-bold text-white mb-6">
            {isRegistering ? 'Crear una cuenta nueva' : 'Iniciar sesión'}
          </h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegistering && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre Completo</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Ingresar'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Toggle de Modo */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs">
            <span className="text-slate-400">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setSuccessMsg(null);
              }}
              className="ml-1.5 text-indigo-400 hover:text-indigo-300 font-bold outline-none cursor-pointer"
            >
              {isRegistering ? 'Iniciar Sesión' : 'Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
