import React, { useState } from 'react';
import { WorkCase, ProjectBlock, ColumnSplit } from '../types';
import { getImageUrl } from '../lib/cloudinary';
import { Maximize2, X } from 'lucide-react';

function getResponsiveTextStyle(
  elementId: string,
  sizeMobile: string,
  sizeTablet: string,
  sizeDesktop: string,
  device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) {
  let className = '';
  let style: React.CSSProperties = {};
  let styleElement: React.ReactNode = null;

  if (device === 'mobile') {
    if (sizeMobile.startsWith('text-')) {
      className = sizeMobile;
    } else {
      style.fontSize = sizeMobile;
    }
  } else if (device === 'tablet') {
    if (sizeTablet.startsWith('text-')) {
      className = sizeTablet;
    } else {
      style.fontSize = sizeTablet;
    }
  } else {
    const classes = [];
    if (sizeMobile.startsWith('text-')) classes.push(sizeMobile);
    if (sizeTablet.startsWith('text-')) classes.push(`md:${sizeTablet}`);
    if (sizeDesktop.startsWith('text-')) classes.push(`lg:${sizeDesktop}`);
    className = classes.join(' ');

    const hasCustom = !sizeMobile.startsWith('text-') || !sizeTablet.startsWith('text-') || !sizeDesktop.startsWith('text-');
    if (hasCustom) {
      const cssRules = [];
      if (!sizeMobile.startsWith('text-')) {
        cssRules.push(`#${elementId} { font-size: ${sizeMobile}; }`);
      }
      if (!sizeTablet.startsWith('text-')) {
        cssRules.push(`@media (min-width: 768px) { #${elementId} { font-size: ${sizeTablet}; } }`);
      }
      if (!sizeDesktop.startsWith('text-')) {
        cssRules.push(`@media (min-width: 1024px) { #${elementId} { font-size: ${sizeDesktop}; } }`);
      }
      styleElement = (
        <style dangerouslySetInnerHTML={{ __html: cssRules.join('\n') }} />
      );
    }
  }

  return { className, style, styleElement };
}

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
function TextBox({
  text,
  className = "",
  fontFamily = 'serif',
  bold = false,
  italic = false,
  sizeMobile = 'text-sm',
  sizeTablet = 'text-base',
  sizeDesktop = 'text-base',
  tracking = 'tracking-normal',
  leading = 'leading-relaxed',
  textAlign = 'left',
  device = 'desktop',
}: {
  text: string;
  className?: string;
  fontFamily?: 'serif' | 'sans';
  bold?: boolean;
  italic?: boolean;
  sizeMobile?: string;
  sizeTablet?: string;
  sizeDesktop?: string;
  tracking?: string;
  leading?: string;
  textAlign?: 'left' | 'center' | 'right';
  device?: 'desktop' | 'tablet' | 'mobile';
}) {
  const boldClass = bold ? 'font-bold' : 'font-normal';
  const italicClass = italic ? 'italic' : 'not-italic';
  const trackingClass = tracking || 'tracking-normal';
  const leadingClass = leading || 'leading-relaxed';
  const fontFamilyClass = fontFamily === 'sans' ? 'font-sans' : 'font-serif';
  
  const elementId = `text-box-preview-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`flex flex-col justify-center gap-4 rounded-2xl p-8 ${className}`}
      style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.02)' }}
    >
      {text.split('\n\n').map((paragraph, idx) => {
        const pId = `${elementId}-${idx}`;
        const { className: resolvedSizeClass, style: sizeStyle, styleElement } = getResponsiveTextStyle(
          pId,
          sizeMobile,
          sizeTablet,
          sizeDesktop,
          device
        );
        const textClass = `text-ink/80 text-${textAlign} ${fontFamilyClass} ${boldClass} ${italicClass} ${trackingClass} ${leadingClass} ${resolvedSizeClass}`;
        return (
          <React.Fragment key={idx}>
            {styleElement}
            <p id={pId} className={textClass} style={sizeStyle}>
              {paragraph}
            </p>
          </React.Fragment>
        );
      })}
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
export function Block({ block, device = 'desktop' }: { block: ProjectBlock; device?: 'desktop' | 'tablet' | 'mobile' }) {
  switch (block.type) {
    case 'image':
      return <Img publicId={block.image.publicId} alt={block.image.alt} />;

    case 'imageFeature': {
      const isMobile = device === 'mobile';
      const gridCols = isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-6';
      const stackedCols = isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-6';
      return (
        <div className={`grid ${gridCols} items-stretch`}>
          <Img publicId={block.main.publicId} alt={block.main.alt} className="h-full" imgClassName="h-full object-cover" />
          <div className={`grid ${stackedCols} self-start`}>
            {block.stacked.map((img, i) => (
              <Img key={i} publicId={img.publicId} alt={img.alt} />
            ))}
          </div>
        </div>
      );
    }

    case 'imagePair': {
      const isMobile = device === 'mobile';
      if (block.matchHeight && block.images.every((img) => img.ratio)) {
        const pairGap = isMobile ? 'gap-3' : 'gap-6';
        return (
          <div className={`flex items-start ${pairGap}`}>
            {block.images.map((img, i) => (
              <div key={i} className="min-w-0" style={{ flex: `${img.ratio} 1 0%` }}>
                <Img publicId={img.publicId} alt={img.alt} />
              </div>
            ))}
          </div>
        );
      }
      const stackOnMobile = block.mobileLayout === 'stack';
      const count = block.images.length;
      const cols = isMobile 
        ? (stackOnMobile ? 'grid-cols-1' : (count === 4 ? 'grid-cols-4' : count === 3 ? 'grid-cols-3' : 'grid-cols-2'))
        : (count === 4 ? 'grid-cols-4' : count === 3 ? 'grid-cols-3' : 'grid-cols-2');
      const gap = isMobile ? 'gap-3' : 'gap-6';

      return (
        <div className={`grid items-stretch ${gap} ${cols}`}>
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
      const isMobile = device === 'mobile';
      
      const isOrderTextFirst = isMobile 
        ? block.mobileOrder === 'textFirst'
        : block.imagePosition === 'right';
        
      const imageOrderClass = isOrderTextFirst ? 'order-2' : 'order-1';
      const textOrderClass = isOrderTextFirst ? 'order-1' : 'order-2';
      
      // Resolve proportions layout
      const layoutOption = block.layout || '50/50';
      let resolvedLayout = layoutOption;
      if (!isMobile && isOrderTextFirst) {
        if (layoutOption === '30/70') resolvedLayout = '70/30';
        else if (layoutOption === '40/60') resolvedLayout = '60/40';
        else if (layoutOption === '60/40') resolvedLayout = '40/60';
        else if (layoutOption === '70/30') resolvedLayout = '30/70';
        else if (layoutOption === '66/34') resolvedLayout = '34/66';
        else if (layoutOption === '34/66') resolvedLayout = '66/34';
      }

      const layoutClasses: Record<string, string> = {
        '30/70': 'grid-cols-[3fr_7fr]',
        '40/60': 'grid-cols-[4fr_6fr]',
        '50/50': 'grid-cols-2',
        '60/40': 'grid-cols-[6fr_4fr]',
        '70/30': 'grid-cols-[7fr_3fr]',
        '66/34': 'grid-cols-[66fr_34fr]',
        '34/66': 'grid-cols-[34fr_66fr]',
      };
      
      const gridColClass = isMobile ? 'grid-cols-1' : (layoutClasses[resolvedLayout] || 'grid-cols-2');
      const gapClass = isMobile ? 'gap-3' : (device === 'tablet' ? 'gap-4' : 'gap-6');

      return (
        <div className={`grid items-stretch ${gapClass} ${gridColClass}`}>
          {heightFromImage ? (
            <Img publicId={block.image.publicId} alt={block.image.alt} className={imageOrderClass} />
          ) : (
            <div
              className={`relative w-full overflow-hidden rounded-2xl ${imageOrderClass}`}
              style={{ aspectRatio: '4 / 3' }}
            >
              <img
                src={getImageUrl(block.image.publicId)}
                alt={block.image.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
          <TextBox
            text={block.text}
            className={textOrderClass}
            fontFamily={block.fontFamily}
            bold={block.bold}
            italic={block.italic}
            sizeMobile={block.sizeMobile}
            sizeTablet={block.sizeTablet}
            sizeDesktop={block.sizeDesktop}
            tracking={block.tracking}
            leading={block.leading}
            textAlign={block.textAlign}
            device={device}
          />
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
      const isFullWidth = block.hasContainer || block.widthMode === 'full';
      const containerWidth = isFullWidth 
        ? 'w-full' 
        : block.widthMode === 'auto' 
          ? 'w-fit max-w-full' 
          : 'max-w-3xl';

      const containerClass = `mx-auto w-full my-4 ${containerWidth} ${
        block.hasContainer 
          ? 'rounded-2xl p-8 md:p-10 shadow-sm' 
          : 'px-6 md:px-0'
      }`;

      const containerStyle = block.hasContainer
        ? { border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.02)' }
        : undefined;

      const innerClass = isFullWidth
        ? 'max-w-3xl mx-auto w-full flex flex-col gap-4'
        : 'w-full flex flex-col gap-4';

      const boldClass = block.bold ? 'font-bold' : 'font-normal';
      const italicClass = block.italic ? 'italic' : 'not-italic';
      const trackingClass = block.tracking || 'tracking-normal';
      const leadingClass = block.leading || 'leading-relaxed';
      const fontFamily = block.fontFamily === 'sans' ? 'font-sans' : 'font-serif';
      
      const sizeMobile = block.sizeMobile || 'text-sm';
      const sizeTablet = block.sizeTablet || 'text-base';
      const sizeDesktop = block.sizeDesktop || 'text-base';

      const elementId = `text-preview-${Math.random().toString(36).substr(2, 9)}`;

      return (
        <div className={containerClass} style={containerStyle}>
          <div className={innerClass}>
            {block.text.split('\n\n').map((paragraph, idx) => {
              const pId = `${elementId}-${idx}`;
              const { className: resolvedSizeClass, style: sizeStyle, styleElement } = getResponsiveTextStyle(
                pId,
                sizeMobile,
                sizeTablet,
                sizeDesktop,
                device
              );
              const textClass = `text-ink/80 text-${block.align || 'left'} ${fontFamily} ${boldClass} ${italicClass} ${trackingClass} ${leadingClass} ${resolvedSizeClass}`;
              return (
                <React.Fragment key={idx}>
                  {styleElement}
                  <p id={pId} className={textClass} style={sizeStyle}>
                    {paragraph}
                  </p>
                </React.Fragment>
              );
            })}
          </div>
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
export const ProjectPreview: React.FC<ProjectPreviewProps & { device?: 'desktop' | 'tablet' | 'mobile' }> = ({ project, device = 'desktop' }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const blocks = project.blocks || [];
  const mainTitle = project.title ?? project.client ?? 'Nombre del Cliente';
  const mainTitleLen = mainTitle.length;

  const renderBlocks = () => {
    if (blocks.length === 0) {
      return null;
    }
    const blocksGap = device === 'mobile' ? 'gap-6' : 'gap-10';
    return (
      <div className={`flex flex-col ${blocksGap}`} style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {blocks.map((block, i) => (
          <Block key={i} block={block} device={device} />
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
      <section className={`px-6 pb-16 ${device === 'mobile' ? 'pb-12' : 'md:px-10 md:pb-28'}`}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Two-column layout on large screens */}
          <div className={`grid ${device === 'mobile' || device === 'tablet' ? 'grid-cols-1 gap-12' : 'grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20'}`}>

            {/* LEFT — título + summary */}
            <div className="lg:col-span-7 flex flex-col gap-4 md:gap-5">
              {(() => {
                const titleId = `title-preview-${Math.random().toString(36).substr(2, 9)}`;
                const { className: titleSizeClass, style: titleSizeStyle, styleElement: titleStyleElement } = getResponsiveTextStyle(
                  titleId,
                  project.titleStyle?.sizeMobile || 'text-4xl',
                  project.titleStyle?.sizeTablet || 'text-6xl',
                  project.titleStyle?.sizeDesktop || 'text-[9rem]',
                  device
                );
                return (
                  <>
                    {titleStyleElement}
                    <h1
                      id={titleId}
                      className={`font-serif text-[#0a0424] text-balance ${
                        project.titleStyle?.bold ? 'font-bold' : 'font-normal'
                      } ${
                        project.titleStyle?.italic !== false ? 'italic' : 'not-italic'
                      } ${
                        project.titleStyle?.tracking || 'tracking-tight'
                      } ${
                        project.titleStyle?.leading || 'leading-[0.95]'
                      } ${titleSizeClass}`}
                      style={titleSizeStyle}
                    >
                      {mainTitle}
                    </h1>
                  </>
                );
              })()}

              {project.title && (() => {
                const clientId = `client-preview-${Math.random().toString(36).substr(2, 9)}`;
                const { className: clientSizeClass, style: clientSizeStyle, styleElement: clientStyleElement } = getResponsiveTextStyle(
                  clientId,
                  project.clientStyle?.sizeMobile || 'text-sm',
                  project.clientStyle?.sizeTablet || 'text-sm',
                  project.clientStyle?.sizeDesktop || 'text-base',
                  device
                );
                return (
                  <>
                    {clientStyleElement}
                    <p
                      id={clientId}
                      className={`font-sans font-bold uppercase tracking-widest text-black/70 ${clientSizeClass}`}
                      style={{ letterSpacing: '0.15em', ...clientSizeStyle }}
                    >
                      {project.client}
                    </p>
                  </>
                );
              })()}

              <div style={{ width: '4rem', height: '1px', background: '#a52f18', marginTop: '0.25rem' }} />

              {(() => {
                const summaryId = `summary-preview-${Math.random().toString(36).substr(2, 9)}`;
                const { className: summarySizeClass, style: summarySizeStyle, styleElement: summaryStyleElement } = getResponsiveTextStyle(
                  summaryId,
                  project.summaryStyle?.sizeMobile || 'text-[1.125rem]',
                  project.summaryStyle?.sizeTablet || 'text-[1.125rem]',
                  project.summaryStyle?.sizeDesktop || 'text-[1.125rem]',
                  device
                );
                return (
                  <>
                    {summaryStyleElement}
                    <p
                      id={summaryId}
                      className={`font-medium leading-[1.5] text-black/80 ${summarySizeClass}`}
                      style={{ maxWidth: '42rem', ...summarySizeStyle }}
                    >
                      {project.summary || ''}
                    </p>
                  </>
                );
              })()}
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
