import React, { useState } from 'react';
import { WorkCase, ProjectBlock, ColumnSplit } from '../types';
import { getImageUrl } from '../lib/cloudinary';
import { Maximize2, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Color tokens (exactos del frontend)
// ─────────────────────────────────────────────
// cream  = #FEFAF9
// ink    = #000000
// red    = #a52f18
// navy   = #0a0424

interface ProjectPreviewProps {
  project: Partial<WorkCase>;
}

// ─────────────────────────────────────────────
// Img — idéntico al <Img> del frontend
// (sin hover ni lightbox, solo visual)
// ─────────────────────────────────────────────
function Img({
  publicId,
  alt,
  aspect,
  className = '',
  imgClassName = '',
}: {
  publicId: string;
  alt: string;
  aspect?: string;    // CSS aspect-ratio value, e.g. "4 / 5"
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={`block w-full overflow-hidden rounded-2xl ${className}`}>
      <img
        src={getImageUrl(publicId)}
        alt={alt}
        style={aspect ? { aspectRatio: aspect, objectFit: 'cover', width: '100%' } : undefined}
        className={`w-full rounded-2xl ${imgClassName}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// TextBox — idéntico al del frontend
// ─────────────────────────────────────────────
function TextBox({ text }: { text: string }) {
  return (
    <div
      className="flex flex-col justify-center gap-4 rounded-2xl p-8"
      style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.02)' }}
    >
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'rgba(0,0,0,0.8)' }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// StatsPanel — idéntico al del frontend
// ─────────────────────────────────────────────
function StatsPanel({
  title,
  items,
  highlight,
}: {
  title?: string;
  items: { value: number; prefix?: string; suffix?: string; label: string; decimals?: number }[];
  highlight?: { value: number; prefix?: string; suffix?: string; label: string };
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-12 md:px-12 md:py-16"
      style={{
        background: 'linear-gradient(135deg, #B8381D, #A52F18, #751C0C)',
        color: '#FEFAF9',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent, rgba(255,255,255,0.10))' }}
      />
      <div className="relative z-10 flex flex-col gap-10">
        {title && (
          <p
            className="flex items-center gap-4 text-xs font-bold uppercase"
            style={{ letterSpacing: '0.2em', color: 'rgba(254,250,249,0.70)' }}
          >
            <span style={{ height: '1px', width: '3rem', background: 'rgba(254,250,249,0.40)', display: 'inline-block' }} />
            {title}
          </p>
        )}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((stat, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span style={{ height: '1px', width: '2rem', background: 'rgba(254,250,249,0.40)', display: 'block' }} />
              <span
                className="font-serif"
                style={{ fontSize: '2.5rem', lineHeight: 1, color: '#FEFAF9' }}
              >
                {stat.prefix}{stat.value}{stat.suffix}
              </span>
              <span
                className="text-xs uppercase font-bold"
                style={{ letterSpacing: '0.15em', color: 'rgba(254,250,249,0.70)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        {highlight && (
          <div
            className="flex flex-col gap-3 pt-8"
            style={{ borderTop: '1px solid rgba(254,250,249,0.25)' }}
          >
            <span className="font-serif" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
              {highlight.prefix}{highlight.value}{highlight.suffix}
            </span>
            <span
              className="text-sm uppercase"
              style={{ letterSpacing: '0.15em', color: 'rgba(254,250,249,0.80)' }}
            >
              {highlight.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Testimonial — idéntico al del frontend
// ─────────────────────────────────────────────
function Testimonial({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <figure
      className="relative overflow-hidden rounded-2xl px-8 py-12 md:px-16 md:py-20"
      style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.02)' }}
    >
      <blockquote
        className="font-serif italic"
        style={{ fontSize: '1.75rem', lineHeight: 1.25, color: '#0a0424' }}
      >
        {quote}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        <span style={{ height: '1px', width: '2.5rem', background: '#a52f18', display: 'inline-block' }} />
        <span
          className="text-xs font-bold uppercase"
          style={{ letterSpacing: '0.15em', color: 'rgba(0,0,0,0.60)' }}
        >
          {author} — {role}
        </span>
      </figcaption>
    </figure>
  );
}

// ─────────────────────────────────────────────
// Block renderer — copia exacta de ProjectBlocks.tsx
// ─────────────────────────────────────────────
export function Block({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case 'image':
      return <Img publicId={block.image.publicId} alt={block.image.alt} />;

    case 'imageFeature':
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 items-stretch">
          <Img publicId={block.main.publicId} alt={block.main.alt} className="h-full" imgClassName="h-full object-cover" />
          <div className="grid grid-cols-2 gap-3 self-start md:grid-cols-1 md:gap-6">
            {block.stacked.map((img, i) => (
              <Img key={i} publicId={img.publicId} alt={img.alt} />
            ))}
          </div>
        </div>
      );

    case 'imagePair': {
      // matchHeight: anchos proporcionales al ratio de cada foto
      if (block.matchHeight && block.images.every((img) => img.ratio)) {
        return (
          <div className="flex items-start gap-3 md:gap-6">
            {block.images.map((img, i) => (
              <div key={i} className="min-w-0" style={{ flex: `${img.ratio} 1 0%` }}>
                <Img publicId={img.publicId} alt={img.alt} />
              </div>
            ))}
          </div>
        );
      }
      const stackOnMobile = block.mobileLayout === 'stack';
      return (
        <div
          className={`grid items-stretch gap-3 md:grid-cols-2 md:gap-6 ${
            stackOnMobile ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {block.images.map((img, i) => (
            <Img
              key={i}
              publicId={img.publicId}
              alt={img.alt}
              aspect={block.aspect && block.aspect !== 'auto' ? block.aspect.replace(':', ' / ') : undefined}
              className="h-full w-full"
              imgClassName="h-full object-cover"
            />
          ))}
        </div>
      );
    }

    case 'imageText': {
      const heightFromImage = block.heightFrom === 'image';
      return (
        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 md:gap-6">
          {heightFromImage ? (
            <Img publicId={block.image.publicId} alt={block.image.alt} />
          ) : (
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: '4 / 3' }}
            >
              <img
                src={getImageUrl(block.image.publicId)}
                alt={block.image.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
          <TextBox text={block.text} />
        </div>
      );
    }

    case 'keywords':
      return (
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 text-center"
        >
          {block.items.map((item, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && (
                <span style={{ color: 'rgba(0,0,0,0.30)' }}>·</span>
              )}
              <span
                className="text-xs font-bold uppercase"
                style={{ letterSpacing: '0.2em', color: 'rgba(0,0,0,0.60)' }}
              >
                {item}
              </span>
            </span>
          ))}
        </div>
      );

    case 'quote':
      // En el front, solo muestra la imagen (sin overlay de texto)
      return <Img publicId={block.image.publicId} alt={block.image.alt} />;

    case 'stats':
      return <StatsPanel title={block.title} items={block.items} highlight={block.highlight} />;

    case 'testimonial':
      return <Testimonial quote={block.quote} author={block.author} role={block.role} />;

    case 'text': {
      const containerWidth = 
        block.widthMode === 'full' 
          ? 'w-full' 
          : block.widthMode === 'auto' 
            ? 'w-fit max-w-full' 
            : 'max-w-3xl';

      const containerClass = `mx-auto w-full px-6 md:px-0 my-4 ${containerWidth} ${
        block.hasContainer 
          ? 'rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 md:p-10 flex flex-col gap-4 shadow-sm' 
          : ''
      }`;

      const boldClass = block.bold ? 'font-bold' : 'font-normal';
      const italicClass = block.italic ? 'italic' : 'not-italic';
      const trackingClass = block.tracking || 'tracking-normal';
      const leadingClass = block.leading || 'leading-relaxed';
      const fontFamily = block.fontFamily === 'sans' ? 'font-sans' : 'font-serif';
      
      const sizeMobile = block.sizeMobile || 'text-sm';
      const sizeTablet = block.sizeTablet || 'text-base';
      const sizeDesktop = block.sizeDesktop || 'text-base';

      const textClass = `text-ink/80 text-${block.align || 'left'} ${fontFamily} ${boldClass} ${italicClass} ${trackingClass} ${leadingClass} ${sizeMobile} md:${sizeTablet} lg:${sizeDesktop}`;

      return (
        <div className={containerClass}>
          {block.text.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className={textClass}>
              {paragraph}
            </p>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

// ─────────────────────────────────────────────
// Cover Card Preview — cómo se ve en la grilla
// ─────────────────────────────────────────────
export const CoverCardPreview: React.FC<{ project: Partial<WorkCase> }> = ({ project }) => (
  <div className="rounded-xl overflow-hidden border border-[#E8E3E1] shadow-sm bg-white max-w-xs">
    <div className="relative aspect-[16/10] bg-[#F5EFEF] overflow-hidden">
      {project.cover?.publicId ? (
        <img
          src={getImageUrl(project.cover.publicId)}
          alt={project.client || 'Cover'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[#aaa] text-xs font-mono">Sin portada</span>
        </div>
      )}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-0.5 rounded bg-white/90 text-[10px] font-mono text-[#000] border border-[#E8E3E1]">
          {project.category || 'Categoría'}
        </span>
      </div>
      <div className="absolute top-2 right-2">
        <span className="px-1.5 py-0.5 rounded bg-white/80 text-[10px] font-mono text-[#666]">
          {project.year || '2025'}
        </span>
      </div>
    </div>
    <div className="p-3.5 space-y-1">
      <p className="text-base font-serif text-[#000] font-normal leading-tight">
        {project.client || 'Cliente'}
      </p>
      {project.title && (
        <p className="text-[11px] text-[#666] italic font-serif">{project.title}</p>
      )}
      <p className="text-[11px] text-[#666] leading-snug line-clamp-2 mt-1">
        {project.summary || ''}
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Full Preview — replica exacta de TrabajoDetalle
// ─────────────────────────────────────────────
export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ project }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const blocks = project.blocks || [];
  const mainTitle = project.title ?? project.client ?? 'Nombre del Cliente';
  const mainTitleLen = mainTitle.length;

  const renderBlocks = () => {
    if (blocks.length === 0) {
      return null;
    }
    return (
      <div className="flex flex-col gap-6 md:gap-10" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    );
  };

  const previewContent = (
    <div
      className="bg-[#FEFAF9] text-[#000000] selection:bg-[#a52f18] selection:text-[#FEFAF9]"
      style={{ fontFamily: "'Instrument Sans', sans-serif", minHeight: '100vh', paddingBottom: '8rem' }}
    >
      {/* ── Volver link (decorativo) ── */}
      <div className="px-6 pt-14 pb-8 md:px-10" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <span
          className="inline-flex items-center gap-3 text-xs font-bold uppercase"
          style={{ letterSpacing: '0.15em', color: '#a52f18' }}
        >
          ← Volver a todos los trabajos
        </span>
      </div>

      {/* ── Hero: título + info lateral ── */}
      <section className="px-6 pb-16 md:px-10 md:pb-28">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Two-column layout on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* LEFT — título + summary */}
            <div className="lg:col-span-7 flex flex-col gap-4 md:gap-5">
              <h1
                className={`font-serif text-[#0a0424] text-balance ${
                  project.titleStyle?.bold ? 'font-bold' : 'font-normal'
                } ${
                  project.titleStyle?.italic !== false ? 'italic' : 'not-italic'
                } ${
                  project.titleStyle?.tracking || 'tracking-tight'
                } ${
                  project.titleStyle?.leading || 'leading-[0.95]'
                } ${
                  project.titleStyle?.sizeMobile || 'text-4xl'
                } md:${
                  project.titleStyle?.sizeTablet || 'text-6xl'
                } lg:${
                  project.titleStyle?.sizeDesktop || 'text-[9rem]'
                }`}
              >
                {mainTitle}
              </h1>

              {project.title && (
                <p
                  className="font-sans font-bold uppercase tracking-widest text-sm md:text-base text-black/70"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {project.client}
                </p>
              )}

              <div style={{ width: '4rem', height: '1px', background: '#a52f18', marginTop: '0.25rem' }} />

              <p
                className="font-medium leading-[1.5] text-black/80"
                style={{ fontSize: '1.125rem', maxWidth: '42rem' }}
              >
                {project.summary || ''}
              </p>
            </div>

            {/* RIGHT — category, year, scope */}
            <div className="lg:col-span-5 flex flex-col gap-8 lg:pt-6">
              <div className="flex flex-col gap-2">
                <h4
                  className="text-xs font-bold uppercase text-black/40"
                  style={{ letterSpacing: '0.15em' }}
                >
                  Modalidad
                </h4>
                <p className="text-xl font-medium">{project.category || '—'}</p>
              </div>

              <div className="flex flex-col gap-2">
                <h4
                  className="text-xs font-bold uppercase text-black/40"
                  style={{ letterSpacing: '0.15em' }}
                >
                  Año
                </h4>
                <p className="text-xl font-medium">{project.year || '—'}</p>
              </div>

              {project.scope && project.scope.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4
                    className="text-xs font-bold uppercase text-black/40"
                    style={{ letterSpacing: '0.15em' }}
                  >
                    Alcance del proyecto
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.scope.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-black/5 border border-black/10"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blocks gallery ── */}
      {blocks.length > 0 && (
        <section className="px-6 pb-24 md:px-10">
          {renderBlocks()}
        </section>
      )}

      {/* Empty state */}
      {blocks.length === 0 && !project.client && (
        <div className="py-20 text-center px-8" style={{ color: 'rgba(0,0,0,0.30)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          Completá los datos y bloques para ver la previsualización
        </div>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen overflow-y-auto bg-[#FEFAF9] animate-fadeIn">
        {/* Floating Close Button */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-[#a52f18] text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 border border-white/10"
          >
            <X className="w-4 h-4" />
            <span>Salir de Vista Real</span>
          </button>
        </div>
        {previewContent}
      </div>
    );
  }

  return (
    // Browser chrome
    <div className="rounded-2xl border border-[#E8E3E1] shadow-lg overflow-hidden bg-white">
      {/* Browser bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F5F5] border-b border-[#E8E3E1] flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
        </div>
        <div className="flex-1 bg-white border border-[#E8E3E1] rounded-md px-3 py-1 text-[11px] text-[#666] font-mono truncate">
          craftstudio.com/trabajos/{project.slug || 'proyecto'}
        </div>
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-[#F5EFEF] text-black rounded-lg border border-[#E8E3E1] transition-all cursor-pointer"
        >
          <Maximize2 className="w-3 h-3 text-[#a52f18]" />
          <span>Tamaño Real</span>
        </button>
      </div>

      {/* Scrollable page */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '82vh', background: '#FEFAF9', color: '#000000', fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {previewContent}
      </div>
    </div>
  );
};
