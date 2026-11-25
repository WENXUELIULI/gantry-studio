export type PlanId = 'free' | 'pro';

export const PLAN_STORAGE_KEY = 'gantry:plan:v1';

export const PLAN_LABEL: Record<PlanId, string> = {
  free: 'Free',
  pro: 'Pro',
};

type PlanStorage = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): PlanStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readPlan(source: PlanStorage | null = storage()): PlanId {
  if (!source) return 'free';
  try {
    return source.getItem(PLAN_STORAGE_KEY) === 'pro' ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}

export function savePlan(plan: PlanId, target: PlanStorage | null = storage()): void {
  if (!target) return;
  try {
    target.setItem(PLAN_STORAGE_KEY, plan);
  } catch {
    // Private mode or a full quota must not break editing.
  }
}

export function canExportSource(plan: PlanId): boolean {
  return plan === 'pro';
}
