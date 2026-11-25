export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function hexToRgb(value: string): Rgb {
  const match = HEX.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid hex color: ${value}`);
  }
  const raw = match[1];
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: Rgb): number {
  return (
    0.2126 * channel(color.r) +
    0.7152 * channel(color.g) +
    0.0722 * channel(color.b)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(hexToRgb(foreground));
  const b = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex(color: Rgb): string {
  return `#${[color.r, color.g, color.b]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

/**
 * Keep the hue where possible, but move the foreground toward black or white
 * until it clears the requested contrast ratio against the background.
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minimum = 4.5,
): string {
  if (contrastRatio(foreground, background) >= minimum) {
    return foreground;
  }

  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  const blackRatio = contrastRatio(toHex(black), background);
  const whiteRatio = contrastRatio(toHex(white), background);
  const target = blackRatio >= whiteRatio ? black : white;
  const source = hexToRgb(foreground);

  for (let step = 1; step <= 12; step += 1) {
    const candidate = toHex(mix(source, target, step / 12));
    if (contrastRatio(candidate, background) >= minimum) {
      return candidate;
    }
  }

  return toHex(target);
}
