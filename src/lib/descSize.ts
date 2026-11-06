// La bajada guarda en desc_size un JSON con el tamaño por dispositivo. Las notas
// guardadas antes tienen 'sm' | 'md' | 'lg' y se traducen a su tamaño de entonces.
const LEGACY_DESC_SIZES: Record<string, DescSizes> = {
  sm: { mobile: 'text-base', tablet: 'text-lg', desktop: 'text-lg' },
  md: { mobile: 'text-lg', tablet: 'text-xl', desktop: 'text-xl' },
  lg: { mobile: 'text-xl', tablet: 'text-2xl', desktop: 'text-2xl' },
};

export interface DescSizes {
  mobile: string;
  tablet: string;
  desktop: string;
}

export function parseDescSize(value?: string | null): DescSizes {
  const fallback = LEGACY_DESC_SIZES.lg;
  if (!value) return fallback;
  if (LEGACY_DESC_SIZES[value]) return LEGACY_DESC_SIZES[value];
  try {
    const parsed = JSON.parse(value);
    return {
      mobile: parsed.mobile || fallback.mobile,
      tablet: parsed.tablet || fallback.tablet,
      desktop: parsed.desktop || fallback.desktop,
    };
  } catch {
    return fallback;
  }
}
