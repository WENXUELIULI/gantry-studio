import { useEffect, useState } from 'react';
import { ArrowUpRight, Cloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
        aria-label={t('cloud.title')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          aria-label={`${t('common.close')} ${t('cloud.title')}`}
          onClick={onClose}
        >
          <X size={15} />
        </button>
        <span className="mono auth-kicker">CLOUD / YOUR PROJECTS</span>
        <h2>{t('cloud.title')}</h2>
        <p className="auth-lead">{t('cloud.lead')}</p>

        {loading && <p className="cloud-empty">{t('common.loading')}</p>}
        {error && <p className="auth-error">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="cloud-empty">{t('cloud.empty')}</p>
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
                  {new Date(project.updatedAt).toLocaleDateString(i18n.language)}
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
