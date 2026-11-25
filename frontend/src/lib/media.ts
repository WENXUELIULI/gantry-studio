import type { CSSProperties } from 'react';

export interface Crop {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_CROP: Crop = { x: 50, y: 50, zoom: 1 };

export type CropVars = CSSProperties & Record<`--${string}`, string>;

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function clampCrop(crop: Partial<Crop> | undefined): Crop {
  return {
    x: Math.min(100, Math.max(0, finite(crop?.x, DEFAULT_CROP.x))),
    y: Math.min(100, Math.max(0, finite(crop?.y, DEFAULT_CROP.y))),
    zoom: Math.min(2.5, Math.max(1, finite(crop?.zoom, DEFAULT_CROP.zoom))),
  };
}

export function cropVars(crop: Partial<Crop> | undefined): CropVars {
  const value = clampCrop(crop);
  return {
    '--focal-x': `${value.x}%`,
    '--focal-y': `${value.y}%`,
    '--media-zoom': String(value.zoom),
  } as CropVars;
}

export function cropBackground(crop: Partial<Crop> | undefined) {
  const value = clampCrop(crop);
  return {
    backgroundPosition: `${value.x}% ${value.y}%`,
    backgroundSize: value.zoom > 1 ? `${value.zoom * 100}%` : 'cover',
  };
}
