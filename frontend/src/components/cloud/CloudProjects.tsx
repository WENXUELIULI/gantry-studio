import { useEffect, useState } from 'react';
import { ArrowUpRight, Cloud, X } from 'lucide-react';
import {
  ApiError,
  getPage,
  getProject,
  listProjects,
  readSession,
  type ProjectSummary,
} from '../../lib/api';
import { useProjectStore } from '../../store/project';

export function CloudProjects({
  open,
  onClose,
  onNeedAuth,
}: {
  open: boolean;
  onClose: () => void;
  onNeedAuth: () => void;
}) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useProjectStore((state) => state.hydrateFromCloud);

  useEffect(() => {
    if (!open) return;
    const session = readSession();
    if (!session) {
      onNeedAuth();
      return;
    }
    setLoading(true);
    setError(null);
    listProjects()
      .then(setProjects)
      .catch((cause) =>
        setError(cause instanceof ApiError ? cause.message : '无法读取云端项目'),
      )
      .finally(() => setLoading(false));
  }, [open, onNeedAuth]);

  if (!open) return null;

  const openProject = async (project: ProjectSummary) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getProject(project.id);
      const pages = await Promise.all(
        detail.pages.map((page) => getPage(project.id, page.id)),
      );
      hydrate(detail, pages);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : '项目加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cloud-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="cloud-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="云端项目"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-close" aria-label="关闭云端项目" onClick={onClose}>
          <X size={15} />
        </button>
        <span className="mono auth-kicker">CLOUD / YOUR PROJECTS</span>
        <h2>云端工作区</h2>
        <p className="auth-lead">登录同一账户，PC、手机和 App 看到的是同一份项目。</p>

        {loading && <p className="cloud-empty">读取中…</p>}
        {error && <p className="auth-error">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="cloud-empty">还没有云端项目。从模板库打开一套模板，保存后就会出现在这里。</p>
        )}

        <div className="cloud-list">
          {projects.map((project) => (
            <button
              type="button"
              key={project.id}
              className="cloud-project"
              onClick={() => void openProject(project)}
            >
              <span className="cloud-project-icon">
                <Cloud size={16} strokeWidth={1.5} />
              </span>
              <span>
                <strong>{project.name}</strong>
                <span className="mono">
                  {project.pageCount} PAGES · {project.status} ·{' '}
                  {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                </span>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
