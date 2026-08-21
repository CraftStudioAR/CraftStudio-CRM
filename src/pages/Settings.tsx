import React, { useState, useEffect } from 'react';
import { 
  isSupabaseConfigured, 
  resetLocalData, 
  seedSupabase, 
  fetchBrandLogos, 
  saveBrandLogos 
} from '../lib/supabase';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw,
  AlertTriangle,
  Server,
  Trash2,
  Plus,
  Save,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { getImageUrl } from '../lib/cloudinary';

interface SettingsProps {
  onRefreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onRefreshData }) => {
  const [resetDone, setResetDone] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [seedError, setSeedError] = useState<string | null>(null);

  // Marquee Logos States
  const [logos, setLogos] = useState<Array<{ publicId: string; alt: string }>>([]);
  const [loadingLogos, setLoadingLogos] = useState(true);
  const [savingLogos, setSavingLogos] = useState(false);
  const [logosFeedback, setLogosFeedback] = useState<string | null>(null);
  
  // New Logo Form States
  const [newLogoId, setNewLogoId] = useState('');
  const [newLogoAlt, setNewLogoAlt] = useState('');

  // Load existing logos on mount
  useEffect(() => {
    const loadLogosData = async () => {
      setLoadingLogos(true);
      const data = await fetchBrandLogos();
      setLogos(data);
      setLoadingLogos(false);
    };
    loadLogosData();
  }, []);

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

  const handleAddLogo = () => {
    if (!newLogoId) return;
    const newLogo = {
      publicId: newLogoId,
      alt: newLogoAlt.trim() || 'Logo de Marca',
    };
    setLogos([...logos, newLogo]);
    setNewLogoId('');
    setNewLogoAlt('');
  };

  const handleRemoveLogo = (idx: number) => {
    const updated = [...logos];
    updated.splice(idx, 1);
    setLogos(updated);
  };

  const handleSaveLogosClick = async () => {
    setSavingLogos(true);
    setLogosFeedback(null);
    const res = await saveBrandLogos(logos);
    setSavingLogos(false);
    if (res.success) {
      setLogosFeedback('¡Marquee de logos guardado con éxito!');
      setTimeout(() => setLogosFeedback(null), 3000);
    } else {
      setLogosFeedback(`Error: ${res.error || 'No se pudo guardar'}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-12">
      
      {/* Page Title */}
      <div className="border-b border-[#E8E3E1] pb-5">
        <h1 className="text-2xl font-serif text-[#000000] font-normal flex items-center gap-2">
          <Database className="w-6 h-6 text-[#a52f18]" />
          Ajustes Generales
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Administración de marcas asociadas, integraciones y estado de sincronización.
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

      {/* SECCIÓN DEL MARQUEE DE LOGOS */}
      <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#E8E3E1] pb-4">
          <h2 className="text-lg font-serif text-[#000000] font-normal flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#a52f18]" />
            Marquee de Logos de Clientes
          </h2>
          <p className="text-xs text-[#666666] mt-1">
            Editá los logos que se muestran en el carrusel infinito de la página de inicio.
          </p>
        </div>

        {loadingLogos ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="w-6 h-6 text-[#a52f18] animate-spin" />
            <p className="text-[10px] text-[#666666] font-mono">Cargando logos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Logos Grid */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#000000] uppercase tracking-wide">
                Logos Actuales ({logos.length})
              </label>

              {logos.length === 0 ? (
                <div className="border border-dashed border-[#E8E3E1] rounded-xl p-8 text-center text-[#666666] text-xs bg-[#FEFAF9]">
                  No hay logos configurados en el carrusel.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {logos.map((logo, idx) => (
                    <div 
                      key={idx} 
                      className="group relative bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center"
                    >
                      <div className="w-20 h-10 flex items-center justify-center overflow-hidden bg-white/50 rounded border border-[#E8E3E1]/40">
                        <img 
                          src={getImageUrl(logo.publicId)} 
                          alt={logo.alt} 
                          className="max-w-full max-h-full object-contain pointer-events-none filter brightness-95"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
                          }}
                        />
                      </div>
                      <div className="text-[11px] font-medium text-[#000000] truncate w-full px-1">
                        {logo.alt}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(idx)}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-[#E8E3E1] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                        title="Eliminar logo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Logo Form */}
            <div className="border-t border-[#E8E3E1] pt-6 space-y-4">
              <h3 className="text-xs font-semibold text-[#000000] uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#a52f18]" />
                Agregar Nuevo Logo al Marquee
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                
                {/* Uploader Column */}
                <div className="md:col-span-2">
                  <ImageUploader 
                    value={newLogoId} 
                    onChange={setNewLogoId}
                    className="!p-3.5 bg-[#FEFAF9]"
                  />
                </div>

                {/* Alt Tag & Button Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#000000] uppercase tracking-wider">
                      Nombre de la Marca (Alt text)
                    </label>
                    <input 
                      type="text" 
                      value={newLogoAlt}
                      onChange={(e) => setNewLogoAlt(e.target.value)}
                      placeholder="Ej: Yokoo Studio"
                      className="w-full bg-white border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-xs text-[#000000] outline-none focus:border-[#a52f18] shadow-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLogo}
                    disabled={!newLogoId}
                    className="w-full py-2.5 bg-[#000000] hover:bg-[#a52f18] text-[#FEFAF9] rounded-xl text-xs font-semibold shadow-sm transition-colors active:scale-95 disabled:opacity-50"
                  >
                    Agregar a la Lista
                  </button>
                </div>

              </div>
            </div>

            {/* Save Buttons */}
            <div className="border-t border-[#E8E3E1] pt-4 flex items-center justify-between gap-4">
              <div className="text-xs font-semibold text-emerald-700">
                {logosFeedback}
              </div>
              <button
                type="button"
                onClick={handleSaveLogosClick}
                disabled={savingLogos}
                className="px-5 py-2 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingLogos ? 'Guardando...' : 'Guardar Cambios del Marquee'}</span>
              </button>
            </div>

          </div>
        )}
      </div>

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
          <Database className="w-4 h-4 text-[#a52f18]" />
          Acerca de la Sincronización de contenidos
        </h3>
        <p className="text-xs text-[#666666] leading-relaxed">
          Los contenidos que agregues o edites desde este CRM (proyectos del portafolio, carrusel de logos y artículos de Craft Lab) se guardan de forma instantánea y segura. Para cambiar la portada de la web o modificar secciones estáticas internas, ponte en contacto con el equipo de soporte técnico.
        </p>
      </div>

    </div>
  );
};
