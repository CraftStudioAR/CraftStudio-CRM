import type { ReactNode } from "react";

/**
 * Formato dentro de un bloque de texto (se escribe desde el CRM):
 * **negrita**, *itálica*, __subrayado__ y ^^grande^^. Se pueden anidar (ej. ^^**título**^^).
 * Devuelve nodos de React, nunca HTML, así el texto no puede inyectar nada.
 */
export function renderRichText(text: string): ReactNode[] {
  const pattern = /\*\*(.+?)\*\*|\^\^(.+?)\^\^|__(.+?)__|\*(.+?)\*/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const [, bold, big, underline, italic] = match;
    const key = match.index;
    if (bold !== undefined) {
      nodes.push(<strong key={key} className="font-bold">{renderRichText(bold)}</strong>);
    } else if (big !== undefined) {
      nodes.push(<span key={key} className="text-[1.5em] leading-[1.15]">{renderRichText(big)}</span>);
    } else if (underline !== undefined) {
      nodes.push(<u key={key} className="underline underline-offset-[0.15em]">{renderRichText(underline)}</u>);
    } else {
      nodes.push(<em key={key} className="italic">{renderRichText(italic)}</em>);
    }
    last = pattern.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
