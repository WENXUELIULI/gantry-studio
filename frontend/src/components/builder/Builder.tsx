import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cloud,
  Download,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Monitor,
  Plus,
  Redo2,
  Smartphone,
  Undo2,
  X,
} from 'lucide-react';
import { useBuilderStore } from '../../store/builder';
import { useProjectStore } from '../../store/project';
import { saveProjectToCloud } from '../../lib/cloudSave';
import { readSession } from '../../lib/api';
import { SiteRenderer } from '../site/SiteRenderer';
import { Inspector, type InspectorTab } from './Inspector';
import { SECTION_LABELS, SECTION_TYPES, type SectionType } from '../../types/site';
import { documentStats } from '../../lib/site';
import { LocaleSwitcher } from '../i18n/LocaleSwitcher';

function PageTabs() {
  const { t } = useTranslation();
  const pages = useProjectStore((state) => state.pages);
  const activeKey = useProjectStore((state) => state.activeKey);
  const switchPage = useProjectStore((state) => state.switchPage);
  const addPage = useProjectStore((state) => state.addPage);
  const syncActive = useProjectStore((state) => state.syncActive);
  const updatePageMeta = useProjectStore((state) => state.updatePageMeta);
  const doc = useBuilderStore((state) => state.doc);
  const activePage = pages.find((page) => page.key === activeKey);

  if (!doc || pages.length === 0) return null;

  const commitMeta = (
    key: string,
    patch: { title?: string; path?: string },
  ) => {
    if (patch.title !== undefined && !patch.title.trim()) return;
    if (patch.path !== undefined && !patch.path.trim()) return;
    updatePageMeta(key, patch);
  };

  return (
    <div className="rail-pages">
      {pages.map((page, index) => (
        <button
          type="button"
          key={page.key}
          className={activeKey === page.key ? 'is-active' : ''}
          onClick={() => {
            if (activeKey === page.key) return;
            syncActive(doc);
            switchPage(page.key);
          }}
        >
          <span className="mono">{String(index + 1).padStart(2, '0')}</span>
          <strong>{page.title}</strong>
          <span className="mono">{page.path}</span>
        </button>
      ))}
      {activePage ? (
        <details className="rail-page-meta" key={activePage.key}>
          <summary>页面设置</summary>
          <label>
            <span>{t('builder.pageTitle')}</span>
            <input
              defaultValue={activePage.title}
              aria-label={t('builder.pageTitle')}
              onBlur={(event) => commitMeta(activePage.key, { title: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
          </label>
          <label>
            <span>{t('builder.pagePath')}</span>
            <input
              defaultValue={activePage.path}
              aria-label={t('builder.pagePath')}
              onBlur={(event) => commitMeta(activePage.key, { path: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
          </label>
        </details>
      ) : null}
      <button
        type="button"
        className="rail-page-add"
        aria-label="添加页面"
        onClick={() => {
          syncActive(doc);
          addPage(doc);
        }}
      >
        <Plus size={12} />
        {t('builder.pages')}
      </button>
    </div>
  );
}

function SectionRail() {
  const doc = useBuilderStore((state) => state.doc);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const selectSection = useBuilderStore((state) => state.selectSection);
  const moveSection = useBuilderStore((state) => state.moveSection);
  const toggleSection = useBuilderStore((state) => state.toggleSection);
  const addSection = useBuilderStore((state) => state.addSection);
  const [adding, setAdding] = useState(false);
  if (!doc) return null;
  const stats = documentStats(doc);

  return (
    <aside className="rail">
      <PageTabs />
      <div className="rail-head">
        <span className="mono">PAGE / 首页</span>
        <span className="mono">{String(doc.sections.length).padStart(2, '0')}</span>
      </div>
      <div className="rail-page">
        <span>01</span>
        <strong>首页</strong>
        <span className="mono">HOME</span>
      </div>

      <div className="rail-sections">
        {doc.sections.map((section, index) => (
          <div
            role="button"
            tabIndex={0}
            className={`rail-section ${selectedId === section.id ? 'is-selected' : ''} ${section.visible ? '' : 'is-hidden'}`}
            key={section.id}
            onClick={() => selectSection(section.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectSection(section.id);
              }
            }}
          >
            <GripVertical className="rail-section-grip" size={13} strokeWidth={1.5} />
            <span className="rail-section-node">{String(index + 1).padStart(2, '0')}</span>
            <span className="rail-section-text">
              <strong>{SECTION_LABELS[section.type]}</strong>
              <span>{section.title.split('\n')[0].slice(0, 16) || section.id}</span>
            </span>
            <span className="rail-section-move">
              <button
                type="button"
                aria-label="上移"
                disabled={index === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  moveSection(section.id, -1);
                }}
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label="下移"
                disabled={index === doc.sections.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  moveSection(section.id, 1);
                }}
              >
                <ChevronDown size={12} />
              </button>
            </span>
            <span
              className="rail-section-eye"
              role="button"
              tabIndex={0}
              aria-label={section.visible ? '隐藏区块' : '显示区块'}
              onClick={(event) => {
                event.stopPropagation();
                toggleSection(section.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleSection(section.id);
                }
              }}
            >
              {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </span>
          </div>
        ))}
      </div>

      <div className="rail-add">
        <button type="button" onClick={() => setAdding((value) => !value)}>
          <Plus size={12} />
          添加区块
        </button>
        {adding && (
          <div className="add-menu">
            {SECTION_TYPES.filter((type) => type !== 'hero' && type !== 'footer').map((type: SectionType) => (
              <button
                type="button"
                key={type}
                onClick={() => {
                  addSection(type);
                  setAdding(false);
                }}
              >
                {SECTION_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rail-stats">
        <span>{stats.sections} BLOCKS</span>
        <span>{stats.words} CHARS</span>
      </div>
    </aside>
  );
}

function Canvas() {
  const doc = useBuilderStore((state) => state.doc);
  const device = useBuilderStore((state) => state.device);
  const zoom = useBuilderStore((state) => state.zoom);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const selectSection = useBuilderStore((state) => state.selectSection);
  const setZoom = useBuilderStore((state) => state.setZoom);
  const updateSection = useBuilderStore((state) => state.updateSection);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const base = device === 'desktop' ? 1280 : 390;
      const available = Math.max(stage.clientWidth - 64, 320);
      const next = Math.min(1, Math.max(0.35, available / base));
      setZoom(Math.round(next * 100) / 100);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [device, setZoom]);

  if (!doc) return null;

  return (
    <div className="canvas">
      <div className="canvas-toolbar">
        <span className="mono">LIVE CANVAS</span>
        <span className="canvas-toolbar-path">
          <FileText size={11} strokeWidth={1.7} />
          gantry.site / {doc.code.toLowerCase()} / index
        </span>
        <span className="canvas-toolbar-spacer" />
        <span className="mono">{device === 'desktop' ? '1280 × AUTO' : '390 × 844'}</span>
        <div className="canvas-zoom">
          <button type="button" aria-label="缩小" onClick={() => setZoom(zoom - 0.05)}>
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="放大" onClick={() => setZoom(zoom + 0.05)}>
            +
          </button>
        </div>
      </div>

      <div className="canvas-stage" ref={stageRef}>
        <div
          className="device-shell"
          data-device={device}
          style={{ zoom } as CSSProperties}
        >
          <div className="device-chrome">
            <span className="device-dot" />
            <span className="device-dot" />
            <span className="device-dot" />
            <span className="device-url">
              https://{doc.code.toLowerCase()}.gantry.site
            </span>
          </div>
          <div className="device-notch" />
          <div className="device-screen">
            <SiteRenderer
              doc={doc}
              device={device}
              editable
              selectedId={selectedId}
              onSelect={selectSection}
              onEditSection={(id, field, value) => {
                updateSection(id, (section) => ({ ...section, [field]: value }) as typeof section);
              }}
            />
          </div>
        </div>
        <span className="canvas-hint">CLICK A SECTION TO EDIT · AUTO-SAVED</span>
      </div>
    </div>
  );
}

function PreviewModal({ onClose }: { onClose: () => void }) {
  const doc = useBuilderStore((state) => state.doc);
  const device = useBuilderStore((state) => state.device);
  const setDevice = useBuilderStore((state) => state.setDevice);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  if (!doc) return null;

  return (
    <div className="preview-modal" role="dialog" aria-modal="true" aria-label="站点预览">
      <div className="preview-bar">
        <strong>{doc.name}</strong>
        <span className="mono">PREVIEW / {doc.code}</span>
        <span className="preview-bar-spacer" />
        <button
          type="button"
          className={device === 'desktop' ? 'is-active' : ''}
          onClick={() => setDevice('desktop')}
        >
          <Monitor size={12} />
          桌面
        </button>
        <button
          type="button"
          className={device === 'mobile' ? 'is-active' : ''}
          onClick={() => setDevice('mobile')}
        >
          <Smartphone size={12} />
          手机
        </button>
        <button type="button" onClick={onClose} aria-label="关闭预览">
          <X size={13} />
          关闭
        </button>
      </div>
      <div className="preview-body">
        <div className="preview-frame" data-device={device}>
          <SiteRenderer doc={doc} device={device} editable={false} />
        </div>
      </div>
    </div>
  );
}

function Topbar({
  onPreview,
  onExport,
}: {
  onPreview: () => void;
  onExport: () => void;
}) {
  const doc = useBuilderStore((state) => state.doc);
  const savedAt = useBuilderStore((state) => state.savedAt);
  const device = useBuilderStore((state) => state.device);
  const setDevice = useBuilderStore((state) => state.setDevice);
  const closeProject = useBuilderStore((state) => state.closeProject);
  const setDocumentName = useBuilderStore((state) => state.setDocumentName);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const history = useBuilderStore((state) => state.history);
  const future = useBuilderStore((state) => state.future);
  const [name, setName] = useState(doc?.name ?? '');
  const [cloudState, setCloudState] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setName(doc?.name ?? '');
  }, [doc?.id, doc?.name]);

  if (!doc) return null;

  const commitName = () => {
    if (name.trim() && name.trim() !== doc.name) setDocumentName(name.trim());
    else setName(doc.name);
  };

  const savedLabel = savedAt
    ? `${t('common.saved')} ${new Date(savedAt).toLocaleTimeString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : t('common.save');

  const saveCloud = async () => {
    if (!readSession()) {
      window.dispatchEvent(new Event('gantry:auth'));
      return;
    }
    setCloudState('正在同步…');
    try {
      const result = await saveProjectToCloud();
      setCloudState(`云端已保存 · ${result.pages} 页`);
    } catch (cause) {
      setCloudState(cause instanceof Error ? cause.message : '云端保存失败');
    }
  };

  return (
    <header className="builder-topbar">
      <div className="topbar-brand">
        <span className="gallery-brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <strong>GANTRY</strong>
          <br />
          <span className="mono">FOUNDRY</span>
        </span>
      </div>

      <button type="button" className="topbar-back" onClick={closeProject}>
        <ArrowLeft size={13} />
        {t('common.templates')}
      </button>

      <div className="topbar-project">
        <input
          value={name}
          aria-label="站点名称"
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
        <span className="mono">
          {doc.code} / {doc.industry.toUpperCase()} / {doc.theme.name}
        </span>
      </div>

      <span className="topbar-status">
        <i />
        {cloudState ?? savedLabel}
      </span>

      <span className="topbar-spacer" />

      <LocaleSwitcher compact />

      <div className="topbar-group" aria-label={t('common.undo')}>
        <button type="button" aria-label={t('common.undo')} disabled={!history.length} onClick={undo}>
          <Undo2 size={13} />
        </button>
        <button type="button" aria-label={t('common.redo')} disabled={!future.length} onClick={redo}>
          <Redo2 size={13} />
        </button>
      </div>

      <div className="topbar-group" aria-label={t('common.desktop')}>
        <button
          type="button"
          className={device === 'desktop' ? 'is-active' : ''}
          aria-label={t('common.desktop')}
          onClick={() => setDevice('desktop')}
        >
          <Monitor size={13} />
        </button>
        <button
          type="button"
          className={device === 'mobile' ? 'is-active' : ''}
          aria-label={t('common.mobile')}
          onClick={() => setDevice('mobile')}
        >
          <Smartphone size={13} />
        </button>
      </div>

      <button type="button" className="topbar-action" onClick={() => void saveCloud()}>
        <Cloud size={13} />
        {t('common.cloud')}
      </button>
      <button type="button" className="topbar-action" onClick={onPreview}>
        <Eye size={13} />
        {t('common.preview')}
      </button>
      <button type="button" className="topbar-action topbar-action--primary" onClick={onExport}>
        <Download size={13} />
        {t('common.export')}
      </button>
    </header>
  );
}

export function Builder() {
  const doc = useBuilderStore((state) => state.doc);
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<InspectorTab>('content');

  const content = useMemo(() => {
    if (!doc) return null;
    return (
      <>
        <Topbar onPreview={() => setPreview(true)} onExport={() => setTab('export')} />
        <div className="builder-main">
          <SectionRail />
          <Canvas />
          <Inspector tab={tab} onTab={setTab} />
        </div>
        {preview && <PreviewModal onClose={() => setPreview(false)} />}
      </>
    );
  }, [doc, preview, tab]);

  return <div className="builder">{content}</div>;
}
