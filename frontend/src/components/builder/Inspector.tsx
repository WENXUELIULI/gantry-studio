import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Code2,
  Copy,
  Download,
  Layers,
  Link2,
  Lock,
  Palette,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBuilderStore } from '../../store/builder';
import { useProjectStore } from '../../store/project';
import { LOCALES } from '../../i18n/locales';
import {
  SECTION_LABELS,
  type MediaCrop,
  type NavItem,
  type Product,
  type SiteDocument,
  type SiteSection,
  type Theme,
} from '../../types/site';
import { THEMES } from '../../data/themes';
import { TEMPLATE_BY_ID } from '../../data/templates';
import {
  copyText,
  downloadText,
  safeFilename,
  siteToHtml,
  siteToJson,
} from '../../lib/exportSite';
import { downloadBlob, projectToZip } from '../../lib/exportProject';
import { readSession } from '../../lib/api';
import { documentStats } from '../../lib/site';
import { clampCrop } from '../../lib/media';

const ImageCropper = lazy(() => import('./ImageCropper'));
import {
  canExportSource,
  readPlan,
  savePlan,
  type PlanId,
} from '../../lib/entitlement';
import {
  controlsFor,
  resolveSectionStyle,
  type StyleControl,
} from '../../lib/sectionStyles';

export type InspectorTab = 'content' | 'site' | 'theme' | 'export';

const SANS = "'Archivo Variable', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const SERIF = "'Newsreader Variable', 'Songti SC', 'STSong', 'SimSun', serif";
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

function TextField({
  label,
  value,
  onCommit,
  multiline = false,
  rows = 3,
  placeholder,
  allowEmpty = true,
  hint,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  allowEmpty?: boolean;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    const next = draft.trim();
    if (next === value) return;
    if (!next && !allowEmpty) {
      setDraft(value);
      return;
    }
    onCommit(next);
  };

  return (
    <label className="field">
      <span>
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {multiline ? (
        <textarea
          value={draft}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
        />
      ) : (
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      )}
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MediaField({
  label,
  src,
  alt,
  video = false,
  onCommit,
}: {
  label: string;
  src: string;
  alt?: string;
  video?: boolean;
  onCommit: (src: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(src);

  useEffect(() => {
    setDraft(src);
  }, [src]);

  const isVideo = video || /\.(webm|mp4|mov)(\?|$)/i.test(src);

  return (
    <div className="media-field">
      <div className="media-field-preview">
        {isVideo ? (
          <video src={src} muted playsInline />
        ) : (
          <img src={src} alt={alt ?? ''} />
        )}
      </div>
      <div className="media-field-body">
        <span className="field-label">{label}</span>
        <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
          <label>
            <Upload size={11} strokeWidth={1.8} />
            上传
            <input
              ref={inputRef}
              type="file"
              accept={video ? 'image/*,video/*' : 'image/*'}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const next = String(reader.result);
                  setDraft(next);
                  onCommit(next);
                };
                reader.readAsDataURL(file);
                event.target.value = '';
              }}
            />
          </label>
        </div>
        <p title={draft}>
          {draft.startsWith('data:')
            ? '已上传本地文件（已嵌入）'
            : draft.split('/').pop()}
        </p>
      </div>
    </div>
  );
}

function CropField({
  value,
  src,
  aspect,
  onChange,
}: {
  value?: MediaCrop;
  src?: string;
  aspect?: string;
  onChange: (crop: MediaCrop) => void;
}) {
  const crop = clampCrop(value);
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<MediaCrop>) => onChange({ ...crop, ...patch });
  const canCrop = Boolean(src && !/\.(webm|mp4|mov)(\?|$)/i.test(src));

  return (
    <div className="crop-field">
      <div className="crop-field-head">
        <span className="field-label">图片焦点 / CROP</span>
        <div className="crop-field-actions">
          {canCrop && (
            <button type="button" onClick={() => setOpen(true)}>
              打开裁剪
            </button>
          )}
          <button type="button" onClick={() => onChange({ x: 50, y: 50, zoom: 1 })}>
            重置焦点
          </button>
        </div>
      </div>
      <label className="field">
        <span>
          焦点 X<em>{Math.round(crop.x)}%</em>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={crop.x}
          onChange={(event) => update({ x: Number(event.target.value) })}
        />
      </label>
      <label className="field">
        <span>
          焦点 Y<em>{Math.round(crop.y)}%</em>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={crop.y}
          onChange={(event) => update({ y: Number(event.target.value) })}
        />
      </label>
      <label className="field">
        <span>
          缩放<em>{crop.zoom.toFixed(2)}×</em>
        </span>
        <input
          type="range"
          min={1}
          max={2.5}
          step={0.05}
          value={crop.zoom}
          onChange={(event) => update({ zoom: Number(event.target.value) })}
        />
      </label>
      {open && canCrop && src && (
        <Suspense fallback={<span className="crop-loading mono">LOADING CROPPER…</span>}>
          <ImageCropper
            src={src}
            crop={crop}
            aspect={aspect}
            onApply={(next) => {
              onChange(next);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

function ItemsEditor<T>({
  title,
  items,
  create,
  onChange,
  render,
}: {
  title: string;
  items: T[];
  create: () => T;
  onChange: (items: T[]) => void;
  render: (item: T, update: (next: T) => void, index: number) => ReactNode;
}) {
  return (
    <div className="inspector-group">
      <div className="inspector-group-head">
        <span className="mono">{title}</span>
        <button type="button" onClick={() => onChange([...items, create()])}>
          <Plus size={10} />
          添加
        </button>
      </div>
      {items.map((item, index) => (
        <div className="item-card" key={index}>
          <div className="item-card-head">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <button
              type="button"
              aria-label="删除该项"
              onClick={() =>
                onChange(items.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <Trash2 size={12} strokeWidth={1.7} />
            </button>
          </div>
          {render(
            item,
            (next) =>
              onChange(
                items.map((current, itemIndex) =>
                  itemIndex === index ? next : current,
                ),
              ),
            index,
          )}
        </div>
      ))}
    </div>
  );
}

function useSectionUpdate(section: SiteSection) {
  const updateSection = useBuilderStore((state) => state.updateSection);
  return (patch: Partial<SiteSection>) => {
    updateSection(
      section.id,
      (current) => ({ ...current, ...patch }) as SiteSection,
    );
  };
}

function HeroFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'hero' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <SelectField
        label="首屏叙事"
        value={section.heroKind}
        options={[
          { value: 'video-scrub', label: '滚动视频' },
          { value: 'image-collage', label: '图片拼贴' },
          { value: 'split-editorial', label: '分屏编辑' },
          { value: 'full-bleed', label: '全幅影像' },
          { value: 'kinetic-type', label: '动能字体' },
          { value: 'product-stage', label: '产品舞台' },
        ]}
        onChange={(heroKind) => set({ heroKind })}
      />
      <TextField
        label="地点 / 编号"
        value={section.location}
        onCommit={(location) => set({ location })}
      />
      <TextField
        label="主按钮"
        value={section.primaryCta}
        onCommit={(primaryCta) => set({ primaryCta })}
      />
      <TextField
        label="次按钮"
        value={section.secondaryCta}
        onCommit={(secondaryCta) => set({ secondaryCta })}
      />
      <MediaField
        label="主视觉 / 视频"
        src={section.media.src}
        alt={section.media.alt}
        video
        onCommit={(src) => set({ media: { ...section.media, src } })}
      />
      <CropField
        value={section.media.crop}
        src={section.media.src}
        aspect="16 / 9"
        onChange={(crop) => set({ media: { ...section.media, crop } })}
      />
      <TextField
        label="主视觉说明"
        value={section.media.alt}
        onCommit={(alt) => set({ media: { ...section.media, alt } })}
      />
      <ItemsEditor
        title="参数行 / SPEC ROWS"
        items={section.specRows}
        create={() => ({ label: '新参数', value: '0' })}
        onChange={(specRows) => set({ specRows })}
        render={(row, update) => (
          <>
            <TextField
              label="标签"
              value={row.label}
              onCommit={(label) => update({ ...row, label })}
            />
            <TextField
              label="值"
              value={row.value}
              onCommit={(value) => update({ ...row, value })}
            />
          </>
        )}
      />
      <div className="inspector-group">
        <div className="inspector-group-head">
          <span className="mono">拼贴图 / COLLAGE</span>
          <button
            type="button"
            onClick={() =>
              set({
                collage: [
                  ...section.collage,
                  { src: '/assets/factory-01.jpg', alt: '新增拼贴图' },
                ],
              })
            }
          >
            <Plus size={10} />
            添加
          </button>
        </div>
        {section.collage.map((image, index) => (
          <div className="item-card" key={`${image.src}-${index}`}>
            <div className="item-card-head">
              <span>PLATE {String(index + 1).padStart(2, '0')}</span>
              <button
                type="button"
                aria-label="删除拼贴图"
                onClick={() =>
                  set({
                    collage: section.collage.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
              >
                <Trash2 size={12} strokeWidth={1.7} />
              </button>
            </div>
            <MediaField
              label="图片"
              src={image.src}
              alt={image.alt}
              onCommit={(src) =>
                set({
                  collage: section.collage.map((current, itemIndex) =>
                    itemIndex === index ? { ...current, src } : current,
                  ),
                })
              }
            />
            <TextField
              label="说明"
              value={image.caption ?? ''}
              onCommit={(caption) =>
                set({
                  collage: section.collage.map((current, itemIndex) =>
                    itemIndex === index ? { ...current, caption } : current,
                  ),
                })
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}

function MetricsFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'metrics' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <ItemsEditor
      title="数字 / METRICS"
      items={section.items}
      create={() => ({ value: '00', label: '新指标', note: '说明' })}
      onChange={(items) => set({ items })}
      render={(item, update) => (
        <>
          <TextField
            label="数值"
            value={item.value}
            onCommit={(value) => update({ ...item, value })}
          />
          <TextField
            label="标签"
            value={item.label}
            onCommit={(label) => update({ ...item, label })}
          />
          <TextField
            label="注释"
            value={item.note ?? ''}
            onCommit={(note) => update({ ...item, note })}
          />
        </>
      )}
    />
  );
}

function CapabilityFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'capabilities' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <SelectField
        label="布局"
        value={section.variant}
        options={[
          { value: 'rows', label: '编辑式行' },
          { value: 'grid', label: '卡片网格' },
          { value: 'sticky', label: '左侧吸附' },
        ]}
        onChange={(variant) => set({ variant })}
      />
      <ItemsEditor
        title="能力 / CAPABILITIES"
        items={section.items}
        create={() => ({
          index: '00',
          title: '新能力',
          body: '描述这项能力解决什么问题。',
        })}
        onChange={(items) => set({ items })}
        render={(item, update) => (
          <>
            <TextField
              label="编号"
              value={item.index}
              onCommit={(index) => update({ ...item, index })}
            />
            <TextField
              label="标题"
              value={item.title}
              onCommit={(title) => update({ ...item, title })}
            />
            <TextField
              label="正文"
              value={item.body}
              multiline
              onCommit={(body) => update({ ...item, body })}
            />
          </>
        )}
      />
    </>
  );
}

function ProductFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'products' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <SelectField
        label="布局"
        value={section.variant}
        options={[
          { value: 'cards', label: '图片卡片' },
          { value: 'index', label: '目录索引' },
          { value: 'stage', label: '主推舞台' },
        ]}
        onChange={(variant) => set({ variant })}
      />
      <ItemsEditor<Product>
        title="产品 / PRODUCTS"
        items={section.items}
        create={() => ({
          id: `product-${Date.now()}`,
          name: '新产品',
          code: 'NEW-00',
          spec: '写清楚规格、材质与适用场景。',
          image: '/assets/factory-02.jpg',
          tags: ['定制'],
        })}
        onChange={(items) => set({ items })}
        render={(item, update) => (
          <>
            <TextField
              label="名称"
              value={item.name}
              onCommit={(name) => update({ ...item, name })}
            />
            <div className="field-row">
              <TextField
                label="编号"
                value={item.code}
                onCommit={(code) => update({ ...item, code })}
              />
              <TextField
                label="标签（逗号分隔）"
                value={item.tags.join(', ')}
                onCommit={(tags) =>
                  update({
                    ...item,
                    tags: tags
                      .split(/[,，]/)
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <TextField
              label="规格说明"
              value={item.spec}
              multiline
              onCommit={(spec) => update({ ...item, spec })}
            />
            <MediaField
              label="产品图"
              src={item.image}
              alt={item.name}
              onCommit={(image) => update({ ...item, image })}
            />
            <CropField
              value={item.crop}
              src={item.image}
              aspect="4 / 3"
              onChange={(crop) => update({ ...item, crop })}
            />
          </>
        )}
      />
    </>
  );
}

function ProcessFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'process' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <ItemsEditor
      title="流程 / PROCESS"
      items={section.items}
      create={() => ({
        index: '00',
        title: '新步骤',
        body: '这一步发生了什么？',
        time: 'T+0',
      })}
      onChange={(items) => set({ items })}
      render={(item, update) => (
        <>
          <div className="field-row">
            <TextField
              label="编号"
              value={item.index}
              onCommit={(index) => update({ ...item, index })}
            />
            <TextField
              label="周期"
              value={item.time}
              onCommit={(time) => update({ ...item, time })}
            />
          </div>
          <TextField
            label="标题"
            value={item.title}
            onCommit={(title) => update({ ...item, title })}
          />
          <TextField
            label="正文"
            value={item.body}
            multiline
            onCommit={(body) => update({ ...item, body })}
          />
        </>
      )}
    />
  );
}

function ProofFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'proof' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <TextField
        label="客户证言"
        value={section.quote}
        multiline
        rows={5}
        onCommit={(quote) => set({ quote })}
      />
      <div className="field-row">
        <TextField
          label="姓名"
          value={section.author}
          onCommit={(author) => set({ author })}
        />
        <TextField
          label="职位"
          value={section.role}
          onCommit={(role) => set({ role })}
        />
      </div>
      <ItemsEditor
        title="成果数字 / STATS"
        items={section.stats}
        create={() => ({ value: '00', label: '新成果' })}
        onChange={(stats) => set({ stats })}
        render={(item, update) => (
          <>
            <TextField
              label="数值"
              value={item.value}
              onCommit={(value) => update({ ...item, value })}
            />
            <TextField
              label="标签"
              value={item.label}
              onCommit={(label) => update({ ...item, label })}
            />
          </>
        )}
      />
      <TextField
        label="客户名单（逗号分隔）"
        value={section.clients.join(', ')}
        multiline
        onCommit={(clients) =>
          set({
            clients: clients
              .split(/[,，]/)
              .map((client) => client.trim())
              .filter(Boolean),
          })
        }
      />
    </>
  );
}

function CtaFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'cta' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <TextField
        label="大标题"
        value={section.headline}
        multiline
        rows={3}
        onCommit={(headline) => set({ headline })}
      />
      <TextField
        label="正文"
        value={section.body}
        multiline
        onCommit={(body) => set({ body })}
      />
      <TextField
        label="主按钮"
        value={section.primaryCta}
        onCommit={(primaryCta) => set({ primaryCta })}
      />
      <TextField
        label="次按钮"
        value={section.secondaryCta}
        onCommit={(secondaryCta) => set({ secondaryCta })}
      />
      {section.media && (
        <MediaField
          label="背景图"
          src={section.media.src}
          alt={section.media.alt}
          onCommit={(src) => set({ media: { ...section.media!, src } })}
        />
      )}
    </>
  );
}

function FooterFields({
  section,
}: {
  section: Extract<SiteSection, { type: 'footer' }>;
}) {
  const set = useSectionUpdate(section);
  return (
    <>
      <TextField
        label="说明"
        value={section.note}
        multiline
        onCommit={(note) => set({ note })}
      />
      <TextField
        label="版权"
        value={section.legal}
        onCommit={(legal) => set({ legal })}
      />
      <ItemsEditor
        title="页脚栏目 / COLUMNS"
        items={section.columns}
        create={() => ({ title: '新栏目', links: ['链接'] })}
        onChange={(columns) => set({ columns })}
        render={(item, update) => (
          <>
            <TextField
              label="栏目标题"
              value={item.title}
              onCommit={(title) => update({ ...item, title })}
            />
            <TextField
              label="链接（逗号分隔）"
              value={item.links.join(', ')}
              onCommit={(links) =>
                update({
                  ...item,
                  links: links
                    .split(/[,，]/)
                    .map((link) => link.trim())
                    .filter(Boolean),
                })
              }
            />
          </>
        )}
      />
    </>
  );
}

function SectionStylePanel({ section }: { section: SiteSection }) {
  const set = useSectionUpdate(section);
  const current = resolveSectionStyle(section.style, section.type);

  const change = (control: StyleControl, value: string) => {
    const next = control.key === 'columns' ? Number(value) : value;
    set({ style: { ...current, [control.key]: next } });
  };

  return (
    <div className="inspector-group" data-testid="section-style-panel">
      <div className="inspector-group-head">
        <span className="mono">区块样式 / SECTION STYLE</span>
        <button type="button" onClick={() => set({ style: undefined })}>
          重置区块样式
        </button>
      </div>
      <div className="field-row">
        {controlsFor(section.type).map((control) => (
          <SelectField
            key={control.key}
            label={`区块${control.label}`}
            value={String(current[control.key])}
            options={control.options}
            onChange={(value) => change(control, value)}
          />
        ))}
      </div>
      <p className="style-hint">
        这里的设置只作用于当前区块，并会随 JSON / HTML 一起导出。
      </p>
    </div>
  );
}

function ContentPanel({
  doc,
  section,
}: {
  doc: SiteDocument;
  section: SiteSection;
}) {
  const set = useSectionUpdate(section);
  const duplicateSection = useBuilderStore((state) => state.duplicateSection);
  const removeSection = useBuilderStore((state) => state.removeSection);

  return (
    <>
      <div className="inspector-title">
        <div>
          <h3>{SECTION_LABELS[section.type]}</h3>
          <span className="mono">
            {section.type} / {section.id}
          </span>
        </div>
        <div className="inspector-actions">
          <button
            type="button"
            aria-label="复制区块"
            onClick={() => duplicateSection(section.id)}
          >
            <Copy size={13} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label="删除区块"
            disabled={section.type === 'hero'}
            onClick={() => removeSection(section.id)}
          >
            <Trash2 size={13} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {section.type !== 'hero' && (
        <>
          <TextField
            label="栏目标签 / EYEBROW"
            value={section.eyebrow}
            onCommit={(eyebrow) => set({ eyebrow })}
          />
          <TextField
            label="标题 / TITLE"
            value={section.title}
            multiline
            rows={3}
            allowEmpty={false}
            onCommit={(title) => set({ title })}
          />
          {section.type !== 'footer' && (
            <TextField
              label="导语 / BODY"
              value={section.body ?? ''}
              multiline
              rows={3}
              onCommit={(body) => set({ body })}
            />
          )}
        </>
      )}

      <div className="field-row">
        <SelectField
          label="色调"
          value={section.tone ?? 'light'}
          options={[
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
            { value: 'accent', label: '强调色' },
          ]}
          onChange={(tone) => set({ tone })}
        />
        <label className="field">
          <span>可见</span>
          <select
            value={section.visible ? 'yes' : 'no'}
            onChange={(event) =>
              set({ visible: event.target.value === 'yes' })
            }
          >
            <option value="yes">显示</option>
            <option value="no">隐藏</option>
          </select>
        </label>
      </div>

      <SectionStylePanel section={section} />

      {section.type === 'hero' && <HeroFields section={section} />}
      {section.type === 'metrics' && <MetricsFields section={section} />}
      {section.type === 'capabilities' && (
        <CapabilityFields section={section} />
      )}
      {section.type === 'products' && <ProductFields section={section} />}
      {section.type === 'process' && <ProcessFields section={section} />}
      {section.type === 'proof' && <ProofFields section={section} />}
      {section.type === 'cta' && <CtaFields section={section} />}
      {section.type === 'footer' && <FooterFields section={section} />}

      <div className="export-note">
        当前文档：{doc.sections.length} 个区块 · {doc.theme.name} 主题。
        所有修改自动保存到本地浏览器。
      </div>
    </>
  );
}

function ThemePanel() {
  const doc = useBuilderStore((state) => state.doc);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const setDocumentLocale = useBuilderStore((state) => state.setDocumentLocale);
  if (!doc) return null;
  const theme = doc.theme;

  const fontPair = theme.display.includes('Newsreader')
    ? 'editorial'
    : theme.display.includes('IBM Plex Mono')
      ? 'mono'
      : 'technical';

  const applyTheme = (next: Theme) => {
    updateTheme({ ...next });
  };

  return (
    <>
      <div className="inspector-title">
        <div>
          <h3>主题</h3>
          <span className="mono">
            {theme.name} / {theme.id}
          </span>
        </div>
        <div className="inspector-actions">
          <button
            type="button"
            aria-label="恢复模板主题"
            onClick={() => {
              const template = TEMPLATE_BY_ID[doc.templateId];
              if (template) applyTheme(template.theme);
            }}
          >
            <Palette size={13} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        className="theme-preview"
        style={{ background: theme.paper, color: theme.ink }}
      >
        <strong style={{ fontFamily: theme.display }}>Aa 汉字</strong>
        <span style={{ fontFamily: theme.body }}>
          0123456789
          <br />
          {theme.name}
        </span>
      </div>

      <div className="inspector-group">
        <div className="inspector-group-head">
          <span className="mono">站点语言 / SITE LOCALE</span>
        </div>
        <select
          className="field-select"
          aria-label="站点语言"
          value={doc.locale ?? (doc.market === 'global' ? 'en' : 'zh-CN')}
          onChange={(event) =>
            setDocumentLocale(event.target.value as (typeof LOCALES)[number]['code'])
          }
        >
          {LOCALES.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.nativeName} · {locale.code}
            </option>
          ))}
        </select>
        <p className="style-hint">
          控制导出 HTML 的 lang / dir。阿拉伯语、希伯来语、波斯语、乌尔都语会自动切换为 RTL。
        </p>
      </div>

      <div className="inspector-group">
        <div className="inspector-group-head">
          <span className="mono">预设主题 / PRESETS</span>
        </div>
        <div className="theme-grid">
          {THEMES.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`theme-chip ${item.id === theme.id ? 'is-active' : ''}`}
              onClick={() => applyTheme(item)}
            >
              <div className="theme-chip-swatches">
                <i style={{ background: item.paper }} />
                <i style={{ background: item.ink }} />
                <i style={{ background: item.accent }} />
              </div>
              <strong>{item.name}</strong>
              <span>{item.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <label className="field">
          <span>纸色</span>
          <input
            type="color"
            value={theme.paper}
            onChange={(event) => updateTheme({ paper: event.target.value })}
          />
        </label>
        <label className="field">
          <span>墨色</span>
          <input
            type="color"
            value={theme.ink}
            onChange={(event) => updateTheme({ ink: event.target.value })}
          />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>强调色</span>
          <input
            type="color"
            value={theme.accent}
            onChange={(event) => updateTheme({ accent: event.target.value })}
          />
        </label>
        <label className="field">
          <span>强调色文字</span>
          <input
            type="color"
            value={theme.accentInk}
            onChange={(event) =>
              updateTheme({ accentInk: event.target.value })
            }
          />
        </label>
      </div>

      <SelectField
        label="字体搭配"
        value={fontPair}
        options={[
          { value: 'editorial', label: '编辑衬线 / 正文无衬线' },
          { value: 'technical', label: '技术无衬线 / 正文无衬线' },
          { value: 'mono', label: '等宽标题 / 正文无衬线' },
        ]}
        onChange={(pair) => {
          if (pair === 'editorial')
            updateTheme({ display: SERIF, body: SANS, mono: MONO });
          if (pair === 'technical')
            updateTheme({ display: SANS, body: SANS, mono: MONO });
          if (pair === 'mono')
            updateTheme({ display: MONO, body: SANS, mono: MONO });
        }}
      />

      <label className="field">
        <span>
          圆角
          <em>{theme.radius}px</em>
        </span>
        <input
          type="range"
          min={0}
          max={24}
          step={1}
          value={theme.radius}
          onChange={(event) =>
            updateTheme({ radius: Number(event.target.value) })
          }
        />
      </label>

      <SelectField
        label="背景网格"
        value={theme.grid}
        options={[
          { value: 'blueprint', label: '蓝图网格' },
          { value: 'rule', label: '细分隔线' },
          { value: 'none', label: '无网格' },
        ]}
        onChange={(grid) => updateTheme({ grid })}
      />

      <div className="field-row">
        <label className="field">
          <span>暗色模式</span>
          <select
            value={theme.dark ? 'yes' : 'no'}
            onChange={(event) =>
              updateTheme({ dark: event.target.value === 'yes' })
            }
          >
            <option value="no">关闭</option>
            <option value="yes">开启</option>
          </select>
        </label>
        <label className="field">
          <span>快速反色</span>
          <button
            type="button"
            className="gallery-btn gallery-btn--ghost"
            style={{
              minHeight: 34,
              justifyContent: 'center',
              fontSize: 8,
              padding: '0 8px',
            }}
            onClick={() =>
              updateTheme({
                paper: theme.ink,
                ink: theme.paper,
                dark: !theme.dark,
              })
            }
          >
            交换纸墨
          </button>
        </label>
      </div>

      <div className="export-note">
        主题只影响当前站点，不会改变 GANTRY 产品界面。
        模板决定结构，主题决定语气，两者可以自由组合。
      </div>
    </>
  );
}

function ExportPanel() {
  const doc = useBuilderStore((state) => state.doc);
  const pages = useProjectStore((state) => state.pages);
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState<PlanId>(() => readPlan());
  const [session, setSession] = useState(() => readSession());
  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener('gantry:session', sync);
    return () => window.removeEventListener('gantry:session', sync);
  }, []);
  if (!doc) return null;
  const stats = documentStats(doc);
  const sourceUnlocked = canExportSource(plan);

  const requireLogin = () => {
    if (session) return true;
    window.dispatchEvent(
      new CustomEvent('gantry:auth', {
        detail: { reason: '登录后即可生成并导出官网' },
      }),
    );
    setStatus('error');
    setMessage('请先登录，再生成或导出。');
    return false;
  };

  const unlockSource = () => {
    savePlan('pro');
    setPlan('pro');
    setStatus('ok');
    setMessage('Pro 已解锁（演示模式）。真实项目由服务端校验会员与导出次数。');
  };

  const handleDownload = async () => {
    if (!requireLogin()) return;
    setStatus('working');
    setMessage('正在内嵌图片与视频…');
    try {
      const html = await siteToHtml(doc);
      downloadText(
        `${safeFilename(doc.name)}.html`,
        html,
        'text/html;charset=utf-8',
      );
      setStatus('ok');
      setMessage(
        `已生成 HTML（${(html.length / 1024 / 1024).toFixed(2)} MB）`,
      );
    } catch {
      setStatus('error');
      setMessage('生成失败，请重试。');
    }
  };

  const handleDownloadSite = async () => {
    if (!requireLogin()) return;
    setStatus('working');
    setMessage('正在打包整站页面…');
    try {
      const latest = useProjectStore.getState();
      latest.syncActive(doc);
      const projectPages = latest.pages.length
        ? latest.pages
        : [{ key: 'home', title: doc.name, path: '/', document: doc, version: 0 }];
      const { blob, fileName } = await projectToZip(doc.name, projectPages);
      downloadBlob(blob, fileName);
      setStatus('ok');
      setMessage(`已打包 ${projectPages.length} 个页面（ZIP）。`);
    } catch {
      setStatus('error');
      setMessage('整站打包失败，请重试。');
    }
  };

  const handleCopyHtml = async () => {
    if (!requireLogin()) return;
    setStatus('working');
    setMessage('正在生成并复制…');
    try {
      const html = await siteToHtml(doc);
      const ok = await copyText(html);
      setStatus(ok ? 'ok' : 'error');
      setMessage(ok ? 'HTML 已复制到剪贴板。' : '浏览器拒绝写入剪贴板。');
    } catch {
      setStatus('error');
      setMessage('生成失败，请重试。');
    }
  };

  return (
    <>
      <div className="inspector-title">
        <div>
          <h3>导出</h3>
          <span className="mono">HTML / JSON / SINGLE FILE</span>
        </div>
      </div>

      {!session && (
        <div className="export-login-note">
          <Lock size={13} />
          <p>生成与导出需要登录，项目会同时保存到云端。</p>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('gantry:auth'))
            }
          >
            去登录
          </button>
        </div>
      )}

      <div className="export-stats">
        <div className="export-stat">
          <strong>{stats.sections}</strong>
          <span>区块</span>
        </div>
        <div className="export-stat">
          <strong>{stats.words}</strong>
          <span>字数</span>
        </div>
        <div className="export-stat">
          <strong>{stats.images}</strong>
          <span>媒体</span>
        </div>
        <div className="export-stat">
          <strong>{stats.visible}</strong>
          <span>可见</span>
        </div>
      </div>

      <div className="export-actions">
        <button
          type="button"
          className="primary"
          onClick={handleDownload}
          disabled={status === 'working'}
        >
          <span>下载单文件 HTML</span>
          <Download size={13} />
        </button>
        <button
          type="button"
          className="primary"
          onClick={handleDownloadSite}
          disabled={status === 'working'}
        >
          <span>下载整站 ZIP · {pages.length || 1} 页</span>
          <Download size={13} />
        </button>
        <button
          type="button"
          onClick={handleCopyHtml}
          disabled={status === 'working'}
        >
          <span>复制 HTML</span>
          <Copy size={13} />
        </button>
        <button
          type="button"
          onClick={() =>
            downloadText(
              `${safeFilename(doc.name)}.json`,
              siteToJson(doc),
              'application/json',
            )
          }
          disabled={!sourceUnlocked}
        >
          <span>{sourceUnlocked ? '下载项目源文件' : '项目源文件 · Pro'}</span>
          {sourceUnlocked ? <Code2 size={13} /> : <Lock size={13} />}
        </button>
        <button
          type="button"
          disabled={!sourceUnlocked}
          onClick={async () => {
            const ok = await copyText(siteToJson(doc));
            setStatus(ok ? 'ok' : 'error');
            setMessage(
              ok ? '项目源文件已复制。' : '浏览器拒绝写入剪贴板。',
            );
          }}
        >
          <span>{sourceUnlocked ? '复制项目源文件' : '源文件已锁定'}</span>
          {sourceUnlocked ? <Copy size={13} /> : <Lock size={13} />}
        </button>
      </div>

      <div className={`plan-card${sourceUnlocked ? ' is-pro' : ''}`}>
        <div className="plan-card-head">
          <span className="mono">EXPORT LICENSE</span>
          {sourceUnlocked ? <Sparkles size={14} /> : <Lock size={14} />}
        </div>
        <strong>
          {sourceUnlocked ? 'Pro · 源文件导出已解锁' : 'Free · HTML 发布免费'}
        </strong>
        <p>
          {sourceUnlocked
            ? '当前为演示会员，可下载站点 JSON 源文件。接入后端后，服务端会再次校验会员与导出额度。'
            : 'HTML 单文件导出免费。项目源文件（JSON）属于 Pro 权益，用于接 CMS 或二次开发。'}
        </p>
        {!sourceUnlocked && (
          <button type="button" className="plan-unlock" onClick={unlockSource}>
            <span>解锁 Pro（演示）</span>
            <Sparkles size={13} />
          </button>
        )}
      </div>

      {message && (
        <div
          className="export-note"
          style={{ borderColor: status === 'error' ? '#b93b22' : undefined }}
        >
          {message}
        </div>
      )}

      <div className="export-note">
        导出的 HTML 会内嵌图片和视频，包含响应式样式、滚动视频脚本与移动端菜单。
        直接双击或用任意静态服务器打开即可。
      </div>
    </>
  );
}

function EmptyPanel() {
  return (
    <div className="empty-panel">
      <Layers size={22} strokeWidth={1.4} />
      <h3>选择一个区块</h3>
      <p>在左侧页面结构或画布中点击任意区块，这里会出现它的内容字段。</p>
    </div>
  );
}

function SitePanel() {
  const doc = useBuilderStore((state) => state.doc);
  const updateNav = useBuilderStore((state) => state.updateNav);
  const pages = useProjectStore((state) => state.pages);
  if (!doc) return null;

  const targets = [
    ...doc.sections.map((section) => ({
      value: `section:${section.id}`,
      label: `# ${SECTION_LABELS[section.type]} · ${section.id}`,
    })),
    ...pages.map((page) => ({
      value: `page:${page.key}`,
      label: `页面 · ${page.title} (${page.path})`,
    })),
  ];

  const currentTarget = (item: NavItem) =>
    item.kind === 'page'
      ? `page:${item.pageKey ?? item.href}`
      : `section:${item.href.replace(/^#/, '')}`;

  const patch = (index: number, next: Partial<NavItem>) =>
    updateNav(
      doc.nav.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...next } : item,
      ),
    );

  const changeTarget = (index: number, value: string) => {
    if (value.startsWith('page:')) {
      const key = value.slice('page:'.length);
      const page = pages.find((candidate) => candidate.key === key);
      if (!page) return;
      patch(index, {
        href: page.path,
        kind: 'page',
        pageKey: page.key,
        labelKey: undefined,
      });
      return;
    }
    const id = value.slice('section:'.length);
    const section = doc.sections.find((candidate) => candidate.id === id);
    patch(index, {
      href: `#${id}`,
      kind: 'section',
      pageKey: undefined,
      labelKey: undefined,
      label: section ? SECTION_LABELS[section.type] : doc.nav[index].label,
    });
  };

  return (
    <div>
      <div className="inspector-head">
        <div>
          <span className="mono">SITE / NAVIGATION</span>
          <h2>站点导航</h2>
        </div>
      </div>
      <div className="inspector-body">
        <p className="style-hint">
          新增页面会自动加入所有页面的导航。也可以把现有链接指向某个页面；画布内点击链接会直接切换页面。
        </p>
        <div className="nav-editor">
          {doc.nav.map((item, index) => {
            const target = currentTarget(item);
            return (
              <div className="nav-editor-row" key={`${item.href}-${index}`}>
                <div className="nav-editor-head">
                  <span className="mono">LINK {String(index + 1).padStart(2, '0')}</span>
                  <button
                    type="button"
                    aria-label={`删除导航 ${item.label}`}
                    onClick={() =>
                      updateNav(doc.nav.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <TextField
                  label="链接文字"
                  value={item.label}
                  onCommit={(label) =>
                    patch(index, {
                      label: label.trim() || item.label,
                      labelKey: undefined,
                    })
                  }
                />
                <SelectField
                  label="链接目标"
                  value={target}
                  options={
                    targets.some((option) => option.value === target)
                      ? targets
                      : [
                          ...targets,
                          {
                            value: target,
                            label: item.kind === 'page' ? `页面 · ${item.href}` : `# ${item.href}`,
                          },
                        ]
                  }
                  onChange={(value) => changeTarget(index, value)}
                />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="button button--ghost nav-add"
          onClick={() =>
            updateNav([
              ...doc.nav,
              {
                label: '新链接',
                href: doc.sections.find((section) => section.type !== 'hero')?.id
                  ? `#${doc.sections.find((section) => section.type !== 'hero')!.id}`
                  : '#main',
                kind: 'section',
              },
            ])
          }
        >
          <Plus size={13} />
          添加导航链接
        </button>
        <div className="nav-page-note">
          <Link2 size={13} />
          <span>
            页面共 {pages.length} 个。路径在「页面设置」中修改，导航链接会自动跟随。
          </span>
        </div>
      </div>
    </div>
  );
}

export function Inspector({
  tab,
  onTab,
}: {
  tab: InspectorTab;
  onTab: (tab: InspectorTab) => void;
}) {
  const { t } = useTranslation();
  const doc = useBuilderStore((state) => state.doc);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const section = doc?.sections.find((item) => item.id === selectedId);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab, selectedId]);

  return (
    <aside className="inspector">
      <div className="inspector-tabs">
        <button
          type="button"
          className={tab === 'content' ? 'is-active' : ''}
          onClick={() => onTab('content')}
        >
          <Layers size={12} />
          {t('builder.contentTab')}
        </button>
        <button
          type="button"
          className={tab === 'site' ? 'is-active' : ''}
          onClick={() => onTab('site')}
        >
          <Settings2 size={12} />
          {t('builder.siteTab')}
        </button>
        <button
          type="button"
          className={tab === 'theme' ? 'is-active' : ''}
          onClick={() => onTab('theme')}
        >
          <Palette size={12} />
          {t('builder.themeTab')}
        </button>
        <button
          type="button"
          className={tab === 'export' ? 'is-active' : ''}
          onClick={() => onTab('export')}
        >
          <Code2 size={12} />
          {t('builder.exportTab')}
        </button>
      </div>
      <div className="inspector-scroll" ref={bodyRef}>
        {tab === 'content' &&
          (doc && section ? (
            <ContentPanel doc={doc} section={section} />
          ) : (
            <EmptyPanel />
          ))}
        {tab === 'site' && <SitePanel />}
        {tab === 'theme' && <ThemePanel />}
        {tab === 'export' && <ExportPanel />}
      </div>
    </aside>
  );
}
