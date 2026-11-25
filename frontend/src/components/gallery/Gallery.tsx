import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import {
  HERO_KIND_BY_ID,
  INDUSTRIES,
  MARKETS,
  STYLES,
  industryLabel,
  marketLabel,
  styleLabel,
} from '../../data/taxonomy';
import type {
  IndustryId,
  MarketId,
  StyleId,
  TemplateDefinition,
} from '../../types/site';

interface GalleryProps {
  onOpen: (templateId: string) => void;
  user?: { displayName: string } | null;
  onCloud?: () => void;
  onAuth?: () => void;
}

const STEPS = [
  {
    index: '01',
    title: '选行业',
    body: '机械、玻璃、商品、半导体、能源、机器人、仪器、建筑。每个行业有自己的信息密度和信任方式。',
    en: 'PICK A VERTICAL',
  },
  {
    index: '02',
    title: '选风格',
    body: '工业编辑、瑞士网格、美式工坊、德式精密、意式社论、日式极简、北欧功能。风格决定语气，而不是只决定颜色。',
    en: 'SET THE TONE',
  },
  {
    index: '03',
    title: '换内容',
    body: '标题、参数、产品图、客户证言都能直接点开改。上传自己的图片，页面会重新排版。',
    en: 'MAKE IT YOURS',
  },
  {
    index: '04',
    title: '生成代码',
    body: '导出单文件 HTML，包含样式、响应式布局和滚动视频脚本。也可以带走 JSON 继续接 CMS。',
    en: 'SHIP THE CODE',
  },
];

function TemplateCard({
  template,
  onOpen,
  index,
}: {
  template: TemplateDefinition;
  onOpen: (id: string) => void;
  index: number;
}) {
  return (
    <button
      type="button"
      className="template-card"
      onClick={() => onOpen(template.id)}
      aria-label={`使用模板 ${template.name}`}
    >
      <div className="template-cover">
        <img className="template-cover-main" src={template.cover.image} alt="" loading="lazy" />
        <img className="template-cover-alt" src={template.cover.secondary} alt="" loading="lazy" />
        <div className="template-cover-shade" />
        <div className="template-cover-top">
          <span className="mono">{template.code}</span>
          <span className="template-kind mono">
            {HERO_KIND_BY_ID[template.heroKind]?.labelEn ?? template.heroKind}
          </span>
        </div>
        <div className="template-cover-bottom">
          <span className="template-cover-index mono">
            {String(index + 1).padStart(2, '0')} / {TEMPLATES.length}
          </span>
          <span className="template-open">
            使用此模板
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </span>
        </div>
      </div>
      <div className="template-meta">
        <div className="template-title-row">
          <h3>{template.name}</h3>
          <span>{template.nameEn}</span>
        </div>
        <div className="template-spec mono">
          <span>{marketLabel(template.market)}</span>
          <span>{industryLabel(template.industry)}</span>
          <span>{styleLabel(template.style)}</span>
          <span>{template.theme.name}</span>
        </div>
      </div>
      <p className="template-summary">{template.summary}</p>
      <div className="template-foot">
        <div className="template-tags">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="template-swatches" aria-hidden="true">
          <i style={{ background: template.theme.paper }} />
          <i style={{ background: template.theme.accent }} />
          <i style={{ background: template.theme.ink }} />
        </div>
      </div>
    </button>
  );
}

export function Gallery({ onOpen, user, onCloud, onAuth }: GalleryProps) {
  const [market, setMarket] = useState<MarketId | 'all'>('all');
  const [industry, setIndustry] = useState<IndustryId | 'all'>('all');
  const [style, setStyle] = useState<StyleId | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEMPLATES.filter((template) => {
      if (market !== 'all' && template.market !== market) return false;
      if (industry !== 'all' && template.industry !== industry) return false;
      if (style !== 'all' && template.style !== style) return false;
      if (!needle) return true;
      return [
        template.name,
        template.nameEn,
        template.code,
        template.summary,
        ...template.tags,
        marketLabel(template.market),
        industryLabel(template.industry),
        styleLabel(template.style),
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [market, industry, style, query]);

  return (
    <div className="gallery">
      <header className="gallery-nav">
        <a className="gallery-brand" href="#top" aria-label="GANTRY 首页">
          <span className="gallery-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>GANTRY</strong>
            <small className="mono">桁架 / SITE FOUNDRY</small>
          </span>
        </a>
        <nav className="gallery-links" aria-label="产品导航">
          <a href="#templates">模板库</a>
          <a href="#how">工作方式</a>
          <a href="#system">主题系统</a>
          <a href="#about">关于</a>
        </nav>
        <div className="gallery-nav-right">
          <span className="gallery-status mono">
            <i aria-hidden="true" />
            {TEMPLATES.length} TEMPLATES ONLINE
          </span>
          <button
            type="button"
            className="gallery-nav-cta gallery-nav-user"
            onClick={user ? onCloud : onAuth}
          >
            {user ? user.displayName : '登录'}
            <ArrowRight size={14} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="gallery-hero">
          <div className="gallery-hero-copy">
            <div className="gallery-kicker mono">
              <span className="gallery-kicker-line" />
              WEBSITE FOUNDRY / FOR INDUSTRY
            </div>
            <h1 className="gallery-headline">
              为工业
              <br />
              造一座
              <br />
              <em>不会过期</em>
              <br />
              的官网。
            </h1>
            <p className="gallery-deck">
              不是套模板。先选行业与语气，再把你自己的产品、参数与故事放进去。
              从滚动视频到图片拼贴，从桌面到手机，一次编辑，生成可部署的代码。
            </p>
            <div className="gallery-actions">
              <a className="gallery-btn gallery-btn--primary" href="#templates">
                浏览 {TEMPLATES.length} 套模板
                <ArrowUpRight size={16} strokeWidth={1.6} />
              </a>
              <a className="gallery-btn gallery-btn--ghost" href="#how">
                看它如何工作
              </a>
            </div>
            <div className="gallery-stats">
              <div>
                <strong>{String(TEMPLATES.length).padStart(2, '0')}</strong>
                <span className="mono">TEMPLATES</span>
              </div>
              <div>
                <strong>{String(INDUSTRIES.length).padStart(2, '0')}</strong>
                <span className="mono">INDUSTRIES</span>
              </div>
              <div>
                <strong>{String(STYLES.length).padStart(2, '0')}</strong>
                <span className="mono">STYLES</span>
              </div>
              <div>
                <strong>{String(MARKETS.length).padStart(2, '0')}</strong>
                <span className="mono">MARKETS</span>
              </div>
            </div>
          </div>

          <div className="gallery-bento" aria-label="模板预览">
            <div className="bento-card bento-card--video">
              <video
                src="/assets/truss-loop.webm"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
              />
              <div className="bento-shade" />
              <div className="bento-top mono">
                <span>TRS-01</span>
                <span>VIDEO SCRUB</span>
              </div>
              <div className="bento-video-label">
                <span className="mono">SCROLL TO PLAY</span>
                <strong>桁架精工</strong>
              </div>
              <div className="bento-progress" aria-hidden="true">
                <span />
              </div>
            </div>

            <div className="bento-card bento-card--glass">
              <img src="/assets/glassware-01.jpg" alt="" />
              <div className="bento-shade" />
              <div className="bento-top mono">
                <span>VTR-02</span>
                <span>IMAGE COLLAGE</span>
              </div>
              <div className="bento-glass-copy">
                <span className="mono">MATERIAL / LIGHT</span>
                <strong>熔光玻璃</strong>
              </div>
            </div>

            <div className="bento-card bento-card--index">
              <div className="bento-index-top mono">
                <span>INDEX / 2026</span>
                <Sparkles size={16} strokeWidth={1.4} />
              </div>
              <div className="bento-index-number">{TEMPLATES.length}</div>
              <div className="bento-index-foot">
                <span>套完整模板</span>
                <span className="mono">13 行业 · 6 首屏 · 2 市场</span>
              </div>
            </div>

            <div className="bento-float mono">
              <i aria-hidden="true" />
              LIVE CANVAS / 60FPS
            </div>
          </div>
        </section>

        <div className="gallery-ticker mono" aria-hidden="true">
          <span>MACHINERY / GLASSWARE / COMMODITY / SEMICONDUCTOR / ENERGY / ROBOTICS / INSTRUMENT / ARCHITECTURE / </span>
          <span>MACHINERY / GLASSWARE / COMMODITY / SEMICONDUCTOR / ENERGY / ROBOTICS / INSTRUMENT / ARCHITECTURE / </span>
        </div>

        <section className="library" id="templates">
          <div className="library-head">
            <div>
              <div className="gallery-kicker mono">
                <span className="gallery-kicker-line" />
                02 / TEMPLATE INDEX
              </div>
              <h2 className="gallery-h2">
                挑一个起点，
                <br />
                然后把它改成你的。
              </h2>
            </div>
            <p>
              每套模板都是完整的八段式页面，不是一张截图。
              点击任意模板进入画布，所有文字、图片、参数都可以替换。
            </p>
          </div>

          <div className="library-controls">
            <div className="filter-row">
              <span className="filter-label mono">市场</span>
              <div className="filter-chips">
                <button
                  type="button"
                  className={market === 'all' ? 'is-active' : ''}
                  onClick={() => setMarket('all')}
                >
                  全部
                  <span>{TEMPLATES.length}</span>
                </button>
                {MARKETS.map((item) => {
                  const count = TEMPLATES.filter(
                    (template) => template.market === item.id,
                  ).length;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={market === item.id ? 'is-active' : ''}
                      onClick={() => setMarket(item.id)}
                    >
                      {item.label}
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label mono">行业</span>
              <div className="filter-chips">
                <button
                  type="button"
                  className={industry === 'all' ? 'is-active' : ''}
                  onClick={() => setIndustry('all')}
                >
                  全部
                  <span>{TEMPLATES.length}</span>
                </button>
                {INDUSTRIES.map((item) => {
                  const count = TEMPLATES.filter(
                    (template) => template.industry === item.id,
                  ).length;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={industry === item.id ? 'is-active' : ''}
                      onClick={() => setIndustry(item.id)}
                    >
                      {item.label}
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label mono">风格</span>
              <div className="filter-chips filter-chips--style">
                <button
                  type="button"
                  className={style === 'all' ? 'is-active' : ''}
                  onClick={() => setStyle('all')}
                >
                  全部
                </button>
                {STYLES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={style === item.id ? 'is-active' : ''}
                    onClick={() => setStyle(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="library-tools">
              <label className="search-field">
                <Search size={15} strokeWidth={1.7} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索行业、风格、关键词…"
                  aria-label="搜索模板"
                />
              </label>
              <span className="result-count mono">
                {String(filtered.length).padStart(2, '0')} / {TEMPLATES.length}
              </span>
            </div>
          </div>

          {filtered.length ? (
            <div className="template-grid">
              {filtered.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                  onOpen={onOpen}
                />
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <span className="mono">NO MATCH / 000</span>
              <h3>没有找到这个组合。</h3>
              <p>换一个行业或风格，或者清空搜索词。</p>
              <button
                type="button"
                className="gallery-btn gallery-btn--primary"
                onClick={() => {
                  setMarket('all');
                  setIndustry('all');
                  setStyle('all');
                  setQuery('');
                }}
              >
                重置筛选
              </button>
            </div>
          )}
        </section>

        <section className="how" id="how">
          <div className="how-head">
            <div>
              <div className="gallery-kicker mono gallery-kicker--light">
                <span className="gallery-kicker-line" />
                03 / METHOD
              </div>
              <h2 className="gallery-h2 gallery-h2--light">
                四步，
                <br />
                从行业到代码。
              </h2>
            </div>
            <p>
              我们把官网拆成可替换的叙事组件。
              你不需要从空白画布开始，也不会被锁死在某个模板里。
            </p>
          </div>
          <div className="how-grid">
            {STEPS.map((step) => (
              <article className="how-step" key={step.index}>
                <span className="how-index mono">{step.index}</span>
                <span className="how-en mono">{step.en}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="system" id="system">
          <div className="system-head">
            <div>
              <div className="gallery-kicker mono">
                <span className="gallery-kicker-line" />
                04 / THEME ENGINE
              </div>
              <h2 className="gallery-h2">
                模板是结构，
                <br />
                主题是语气。
              </h2>
            </div>
            <p>
              样板间和成品的区别，在于你能否换掉它的声音。
              十八套主题控制纸张、油墨、强调色、字体与网格，但不会改变内容结构。国内外市场各有自己的语气。
            </p>
          </div>

          <div className="system-grid">
            <article className="system-feature">
              <span className="mono">SCROLL = TIMELINE</span>
              <h3>让页面滚动，<br />成为视频的时间轴。</h3>
              <p>
                首屏视频不是自动播放的背景。它跟着滚动位置逐帧前进，
                滑到 50%，画面就停在 3 秒。访客控制节奏，而不是被节奏推着走。
              </p>
              <div className="system-video">
                <img src="/assets/factory-01.jpg" alt="" />
                <span className="system-video-line" />
                <span className="system-video-label mono">00:03 / 00:06</span>
              </div>
            </article>

            <article className="system-tile">
              <span className="mono">TEMPLATE ≠ THEME</span>
              <h3>十八套主题，<br />不是十八套皮肤。</h3>
              <div className="theme-strips">
                {['#e8e1d3', '#0c1114', '#f0e7d6', '#080b0d', '#11130d', '#f3f21f'].map(
                  (color) => (
                    <i key={color} style={{ background: color }} />
                  ),
                )}
              </div>
              <p>纸张、油墨、强调色、字体、圆角、网格，九组变量决定一套语气。</p>
            </article>

            <article className="system-tile system-tile--accent">
              <span className="mono">DESKTOP / MOBILE</span>
              <h3>同一份内容，<br />两种呼吸。</h3>
              <div className="device-stack" aria-hidden="true">
                <span className="mini-desktop" />
                <span className="mini-phone" />
              </div>
              <p>画布里一键切换桌面与手机视图，排版实时重排，不是缩小版。</p>
            </article>

            <article className="system-tile">
              <span className="mono">CODE, NOT SCREENSHOT</span>
              <h3>带走的是<br />可部署的文件。</h3>
              <pre className="system-code">{`<section class="hero hero--video">\n  <video src="…"></video>\n  <h1>PRECISION\n  IN MOTION</h1>\n</section>`}</pre>
              <p>单文件 HTML，内嵌 CSS、图片与滚动脚本。打开即用。</p>
            </article>
          </div>
        </section>

        <section className="gallery-cta" id="about">
          <div className="gallery-cta-copy">
            <span className="mono">READY WHEN YOU ARE</span>
            <h2>
              从一个模板开始，
              <br />
              把官网做成你的资产。
            </h2>
          </div>
          <a className="gallery-btn gallery-btn--light" href="#templates">
            进入模板库
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
        </section>
      </main>

      <footer className="gallery-footer">
        <div className="gallery-footer-top">
          <span className="gallery-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>GANTRY®</strong>
          <span className="mono">A WEBSITE FOUNDRY FOR PEOPLE WHO MAKE THINGS.</span>
        </div>
        <div className="gallery-footer-bottom mono">
          <span>© 2026 GANTRY / 桁架</span>
          <span>SHENZHEN · CHINA</span>
          <span>REACT 19 / VITE / TYPESCRIPT</span>
        </div>
      </footer>
    </div>
  );
}
