import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ApiError, login, register, type AuthSession } from '../../lib/api';

type Mode = 'login' | 'register';

export function AuthDialog({
  open,
  reason,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  reason?: string;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session =
        mode === 'login'
          ? await login({ email: email.trim(), password })
          : await register({
              email: email.trim(),
              password,
              displayName: displayName.trim() || email.split('@')[0],
            });
      onAuthenticated(session);
    } catch (cause) {
      const message =
        cause instanceof ApiError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : '无法连接后端，请确认 Spring Boot 已启动。';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="登录 GANTRY"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-close" aria-label="关闭登录" onClick={onClose}>
          <X size={15} />
        </button>
        <span className="mono auth-kicker">ACCOUNT / CLOUD WORKSPACE</span>
        <h2>登录后，继续你的官网。</h2>
        <p className="auth-lead">
          {reason ?? '项目会保存到云端，PC 上没改完的页面，手机打开也能接着改。'}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="登录方式">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              <span>称呼</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="韩工"
                autoComplete="name"
              />
            </label>
          )}
          <label>
            <span>邮箱</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 位"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? '连接中…' : mode === 'login' ? '登录并同步' : '创建账户'}
            <ArrowRight size={14} />
          </button>
        </form>
        <p className="auth-foot mono">JWT · PROJECT CLOUD · MULTI-DEVICE</p>
      </div>
    </div>
  );
}
