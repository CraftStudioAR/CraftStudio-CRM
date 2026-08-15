import React, { useState } from 'react';
import { isSupabaseConfigured, resetLocalData, seedSupabase } from '../lib/supabase';
import { 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface SettingsProps {
  onRefreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onRefreshData }) => {
  const [copied, setCopied] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [seedError, setSeedError] = useState<string | null>(null);

  const sqlQuery = `-- ================================================
-- TABLAS Y POLÍTICAS SQL PARA CRAFT STUDIO CRM
-- Ejecutar en el SQL Editor de Supabase
-- ================================================

-- 1. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  title TEXT,
  category TEXT NOT NULL,
  year TEXT NOT NULL,
  summary TEXT NOT NULL,
  cover JSONB NOT NULL,
  scope JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  blocks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Artículos Craft Lab
CREATE TABLE IF NOT EXISTS craft_lab_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  aspect TEXT DEFAULT 'aspect-[4/5]',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS y lecturas/escrituras públicas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE craft_lab_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de proyectos" ON projects FOR SELECT USING (true);
CREATE POLICY "Escritura de proyectos" ON projects FOR ALL USING (true);

CREATE POLICY "Lectura pública de craft_lab_articles" ON craft_lab_articles FOR SELECT USING (true);
CREATE POLICY "Escritura de craft_lab_articles" ON craft_lab_articles FOR ALL USING (true);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
          Ajustes de Base de Datos & Supabase
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Estado del almacenamiento de datos y guía de vinculación con Supabase SQL
        </p>
      </div>

      {/* Seeding Error Message */}
      {seedStatus === 'error' && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>No se pudieron subir los proyectos: {seedError}</span>
        </div>
      )}

      {/* Seeding Success Message */}
      {seedStatus === 'success' && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Todos los proyectos y artículos originales han sido cargados con éxito en Supabase!</span>
        </div>
      )}

      {/* Current Connection Status */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isSupabaseConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {isSupabaseConfigured ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#000000]">
              {isSupabaseConfigured ? 'Supabase Conectado y Activo' : 'Modo de Almacenamiento Local Activo'}
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed mt-1">
              {isSupabaseConfigured
                ? 'El CRM está sincronizando todos los proyectos y artículos directamente con Supabase.'
                : 'Actualmente el CRM guarda tus cambios en LocalStorage con todos tus proyectos y artículos 100% preservados.'}
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
              {seeding ? 'Subiendo...' : seedStatus === 'success' ? '¡Proyectos Subidos!' : 'Cargar Proyectos Iniciales en Supabase'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleResetLocal}
            className="px-3.5 py-2 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1] flex items-center gap-2 whitespace-nowrap self-start md:self-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#a52f18]" />
            {resetDone ? '¡Datos Restablecidos!' : 'Restablecer Proyectos Originales'}
          </button>
        )}
      </div>

      {/* Supabase Setup Instructions */}
      <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        
        <div className="flex items-center justify-between border-b border-[#E8E3E1] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#000000] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a52f18]" />
              Pasos para conectar Supabase cuando tengas las claves
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">Proceso simple para sincronizar la base de datos remota</p>
          </div>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#a52f18] hover:underline flex items-center gap-1 font-mono font-medium"
          >
            Ir a Supabase.com
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <ol className="space-y-4 text-xs text-[#000000]">
          <li className="flex items-start gap-3 p-3.5 bg-[#FEFAF9] rounded-xl border border-[#E8E3E1]">
            <span className="w-6 h-6 rounded-full bg-[#a52f18] text-[#FEFAF9] font-mono flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <div>
              <p className="font-semibold text-[#000000]">Crear un proyecto en Supabase</p>
              <p className="text-[#666666] mt-0.5">Ingresá a tu cuenta de Supabase y creá un proyecto.</p>
            </div>
          </li>

          <li className="flex items-start gap-3 p-3.5 bg-[#FEFAF9] rounded-xl border border-[#E8E3E1]">
            <span className="w-6 h-6 rounded-full bg-[#a52f18] text-[#FEFAF9] font-mono flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <div>
              <p className="font-semibold text-[#000000]">Ejecutar el Script SQL de Creación de Tablas</p>
              <p className="text-[#666666] mt-0.5">Andá a <strong>SQL Editor</strong> en Supabase, pegá el código de abajo y hacé clic en <strong>Run</strong>.</p>
            </div>
          </li>

          <li className="flex items-start gap-3 p-3.5 bg-[#FEFAF9] rounded-xl border border-[#E8E3E1]">
            <span className="w-6 h-6 rounded-full bg-[#a52f18] text-[#FEFAF9] font-mono flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <div>
              <p className="font-semibold text-[#000000]">Copiar credenciales a `.env.local`</p>
              <p className="text-[#666666] mt-0.5">
                Copiá la <strong>URL del proyecto</strong> y la <strong>anon public key</strong> desde <em>Project Settings &gt; API</em> e ingresalas en <code className="text-[#a52f18] font-mono bg-white border border-[#E8E3E1] px-1 py-0.5 rounded">.env.local</code>.
              </p>
            </div>
          </li>
        </ol>

        {/* Copyable SQL Box */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#666666] flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#a52f18]" />
              Script SQL para crear las tablas
            </span>
            <button
              onClick={handleCopySql}
              className="px-3.5 py-1.5 bg-[#000000] hover:bg-[#a52f18] text-[#FEFAF9] rounded-xl text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡SQL Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#0a0424] border border-[#E8E3E1] font-mono text-[11px] text-[#FEFAF9] overflow-x-auto leading-relaxed">
            {sqlQuery}
          </pre>
        </div>

      </div>

    </div>
  );
};
