export function createId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}-${random}${time}`;
}

export function uniqueSectionId(
  type: string,
  existing: { id: string }[],
): string {
  const base = `${type}-${createId('s')}`;
  let candidate = base;
  let n = 2;
  while (existing.some((section) => section.id === candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
