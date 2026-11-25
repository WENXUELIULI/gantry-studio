export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:8080/api/v1';

const SESSION_KEY = 'gantry:session:v1';

export interface UserView {
  id: string;
  email: string;
  displayName: string;
  plan: 'FREE' | 'PRO' | string;
  createdAt: string;
}

export interface AuthSession {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserView;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  version: number;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
}

export interface PageSummary {
  id: string;
  key: string;
  title: string;
  path: string;
  position: number;
  version: number;
  updatedAt: string;
}

export interface PageDetail extends PageSummary {
  document: Record<string, unknown>;
}

export interface ProjectDetail {
  project: ProjectSummary;
  pages: PageSummary[];
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

async function parseError(response: Response): Promise<ApiError> {
  let code = 'REQUEST_FAILED';
  let message = response.statusText || '请求失败';
  let fields: Record<string, string> | undefined;
  try {
    const body = (await response.json()) as {
      code?: string;
      message?: string;
      fields?: Record<string, string>;
    };
    code = body.code ?? code;
    message = body.message ?? message;
    fields = body.fields;
  } catch {
    // Keep the status text when the server did not return JSON.
  }
  return new ApiError(response.status, code, message, fields);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const session = readSession();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (response.status === 401 && retry && session?.refreshToken && path !== '/auth/refresh') {
    const refreshed = await refreshSession(session.refreshToken);
    if (refreshed) return request<T>(path, init, false);
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function register(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthSession> {
  const session = await request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  saveSession(session);
  return session;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const session = await request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  saveSession(session);
  return session;
}

export async function refreshSession(refreshToken: string): Promise<AuthSession | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      clearSession();
      return null;
    }
    const session = (await response.json()) as AuthSession;
    saveSession(session);
    return session;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const session = readSession();
  try {
    if (session) {
      await request<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    }
  } finally {
    clearSession();
  }
}

export async function currentUser(): Promise<UserView> {
  return request<UserView>('/auth/me');
}

export async function listProjects(): Promise<ProjectSummary[]> {
  return request<ProjectSummary[]>('/projects');
}

export async function createProject(input: {
  name: string;
  slug?: string;
  document: Record<string, unknown>;
}): Promise<ProjectDetail> {
  return request<ProjectDetail>('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  return request<ProjectDetail>(`/projects/${projectId}`);
}

export async function getPage(projectId: string, pageId: string): Promise<PageDetail> {
  return request<PageDetail>(`/projects/${projectId}/pages/${pageId}`);
}

export async function addPage(
  projectId: string,
  input: { title: string; path: string; document: Record<string, unknown> },
): Promise<PageDetail> {
  return request<PageDetail>(`/projects/${projectId}/pages`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePage(
  projectId: string,
  pageId: string,
  input: {
    title: string;
    path: string;
    expectedVersion: number;
    document: Record<string, unknown>;
  },
): Promise<PageDetail> {
  return request<PageDetail>(`/projects/${projectId}/pages/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deletePage(projectId: string, pageId: string): Promise<void> {
  await request<void>(`/projects/${projectId}/pages/${pageId}`, { method: 'DELETE' });
}

export function pageToDocument<T>(page: PageDetail): T {
  return page.document as T;
}
