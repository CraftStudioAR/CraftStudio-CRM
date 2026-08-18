import React, { useState } from 'react';
import { isSupabaseConfigured, resetLocalData, seedSupabase } from '../lib/supabase';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Server
} from 'lucide-react';

interface SettingsProps {
  onRefreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onRefreshData }) => {
  const [resetDone, setResetDone] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleResetLocal = () => {
    resetLocalData();
    onRefreshData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  const handleSeedSupabase = async () => {
    setSeeding(true);
    setSeedStatus('idle');
    setSeedError(null);
    const res = await seedSupabase();
    setSeeding(false);
    if (res.success) {
      setSeedStatus('success');
      onRefreshData();
      setTimeout(() => setSeedStatus('idle'), 5000);
    } else {
      setSeedStatus('error');
      setSeedError(res.error || 'Error al cargar datos');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-12">
      
      {/* Page Title */}
      <div className="border-b border-[#E8E3E1] pb-5">
        <h1 className="text-2xl font-serif text-[#000000] font-normal flex items-center gap-2">
          <Database className="w-6 h-6 text-[#a52f18]" />
          Ajustes de Almacenamiento
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Administración y estado de sincronización de proyectos y artículos del blog.
        </p>
      </div>

      {/* Seeding Error Message */}
      {seedStatus === 'error' && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>No se pudieron cargar los datos: {seedError}</span>
        </div>
      )}

      {/* Seeding Success Message */}
      {seedStatus === 'success' && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Todos los proyectos y artículos originales han sido cargados con éxito en la base de datos!</span>
        </div>
      )}

      {/* Connection Status Card */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[#E8E3E1] shadow-sm`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#000000]">
              {isSupabaseConfigured ? 'Sincronización en la Nube Activa' : 'Almacenamiento Local Activo'}
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed mt-1">
              {isSupabaseConfigured
                ? 'El panel está conectado a la base de datos central en la nube. Todos los cambios se reflejan en tiempo real en el sitio web de forma automática.'
                : 'Actualmente el CRM está funcionando de manera local. Los cambios se guardan únicamente en este navegador.'}
            </p>
          </div>
        </div>

        {isSupabaseConfigured ? (
          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={handleSeedSupabase}
              disabled={seeding}
              className="px-3.5 py-2 bg-[#a52f18] hover:bg-[#8b2612] disabled:opacity-50 text-[#FEFAF9] rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Sincronizando...' : seedStatus === 'success' ? '¡Sincronizado!' : 'Cargar Datos Iniciales'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleResetLocal}
            className="px-3.5 py-2 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1] flex items-center gap-2 whitespace-nowrap self-start md:self-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#a52f18]" />
            {resetDone ? '¡Datos Restablecidos!' : 'Restablecer Datos Locales'}
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[#000000] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#a52f18]" />
          Acerca de la sincronización de contenidos
        </h3>
        <p className="text-xs text-[#666666] leading-relaxed">
          Los contenidos que agregues o edites desde este CRM (proyectos del portafolio y artículos de Craft Lab) se guardan de forma instantánea y segura. Para cambiar la portada de la web o modificar secciones estáticas internas, ponte en contacto con el equipo de soporte técnico.
        </p>
      </div>

    </div>
  );
};
