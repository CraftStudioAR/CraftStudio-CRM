import React, { useState } from 'react';
import { Database, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Short artificial delay for realistic premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const targetEmail = 'hola@craftstudio.com.ar';
    const targetPassword = 'CraftStudio1!';

    if (email.toLowerCase().trim() === targetEmail && password === targetPassword) {
      // Save session locally
      localStorage.setItem('craftstudio_crm_session', 'active');
      localStorage.setItem('craftstudio_crm_user', email);
      onLoginSuccess();
    } else {
      setError('Credenciales inválidas. Verificá el usuario y la contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FEFAF9] text-[#000000] font-sans flex items-center justify-center px-4 relative overflow-hidden">
      {/* Analog Grain Overlay */}
      <div className="grain-overlay" />

      {/* Decorative background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#a52f18]/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-[#0a0424]/[0.02] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fadeIn z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-white border border-[#E8E3E1] rounded-2xl shadow-sm mb-4">
            <Database className="w-6 h-6 text-[#a52f18]" />
          </div>
          <h1 className="font-serif italic text-4xl text-[#0a0424] leading-none mb-2">
            Craft Studio CRM
          </h1>
          <p className="text-xs text-[#666666] tracking-wide uppercase font-medium">
            Panel de Administración
          </p>
        </div>

        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
          {/* Subtle sheen line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#a52f18]/30 to-transparent" />

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1.5 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#999999]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hola@craftstudio.com.ar"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none transition-all placeholder-[#999999]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666666] mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#999999]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none transition-all placeholder-[#999999]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#999999] hover:text-[#000000]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#a52f18] hover:bg-[#8b2612] disabled:opacity-50 text-[#FEFAF9] rounded-xl text-xs font-bold shadow-sm transition-all active:scale-[0.98] select-none uppercase tracking-widest mt-2"
            >
              {loading ? 'Iniciando Sesión...' : 'Entrar al Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#999999] mt-6 leading-relaxed">
          Propiedad exclusiva de Craft Studio. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
