import type { CSSProperties } from 'react';
import type { SiteDocument } from '../types/site';

export function themeStyle(doc: SiteDocument): CSSProperties {
  const theme = doc.theme;
  return {
    '--paper': theme.paper,
    '--ink': theme.ink,
    '--accent': theme.accent,
    '--accent-ink': theme.accentInk,
    '--muted': theme.muted,
    '--line': theme.line,
    '--display': theme.display,
    '--body': theme.body,
    '--mono': theme.mono,
    '--radius': `${theme.radius}px`,
    '--grid': theme.grid,
    '--surface': theme.surface,
    '--accent-soft': theme.accentSoft,
    '--focus': theme.focus,
    '--display-weight': String(theme.displayWeight),
    '--body-size': `${theme.bodySize}px`,
    '--tracking': theme.tracking,
    '--border-width': `${theme.borderWidth}px`,
    '--section-space': `${theme.sectionSpace}px`,
    '--motion': theme.motion,
  } as CSSProperties;
}
