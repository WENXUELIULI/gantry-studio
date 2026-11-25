import type { CSSProperties } from 'react';
import type {
  CapabilitiesSection,
  CtaSection,
  FooterSection,
  MetricsSection,
  ProcessSection,
  ProductsSection,
  ProofSection,
  SiteSection,
} from '../../types/site';
import { EditableText } from '../editor/EditableText';
import { cropVars } from '../../lib/media';

export interface SectionProps {
  section: SiteSection;
  index: number;
  editable: boolean;
  onEdit?: (field: 'eyebrow' | 'title' | 'body', value: string) => void;
}

function Title({
  section,
  editable,
  onEdit,
  className,
}: SectionProps & { className?: string }) {
  const content = section.title;
  if (editable) {
    return (
      <EditableText
        as="h2"
        value={content}
        editable
        multiline
        className={`section-title ${className ?? ''}`}
        onCommit={(value) => onEdit?.('title', value)}
      />
    );
  }
  return (
    <h2 className={`section-title ${className ?? ''}`}>
      {content.split('\n').map((line, index) => (
        <span className="section-title-line" key={`${line}-${index}`}>
          {line}
        </span>
      ))}
    </h2>
  );
}

function Eyebrow({ section, editable, onEdit }: SectionProps) {
  return (
    <div className="section-eyebrow">
      <span className="section-eyebrow-rule" aria-hidden="true" />
      <EditableText
        as="span"
        value={section.eyebrow}
        editable={editable}
        className="mono"
        onCommit={(value) => onEdit?.('eyebrow', value)}
      />
    </div>
  );
}

function SectionHead({ section, index, editable, onEdit }: SectionProps) {
  return (
    <header className="section-head">
      <div className="section-index mono" aria-hidden="true">
        {String(index).padStart(2, '0')}
      </div>
      <div className="section-head-main">
        <Eyebrow section={section} index={index} editable={editable} onEdit={onEdit} />
        <Title section={section} index={index} editable={editable} onEdit={onEdit} />
        {section.body && (
          <EditableText
            as="p"
            value={section.body}
            editable={editable}
            multiline
            className="section-deck"
            onCommit={(value) => onEdit?.('body', value)}
          />
        )}
      </div>
      <div className="section-head-mark mono" aria-hidden="true">
        § {String(index).padStart(2, '0')}
      </div>
    </header>
  );
}

function Metrics({ section, index }: SectionProps & { section: MetricsSection }) {
  return (
    <div className="metrics-grid">
      {section.items.map((item, itemIndex) => (
        <article className="metric" key={`${item.label}-${itemIndex}`}>
          <div className="metric-value">{item.value}</div>
          <div className="metric-label">{item.label}</div>
          {item.note && <div className="metric-note mono">{item.note}</div>}
          <span className="metric-corner" aria-hidden="true" />
        </article>
      ))}
      <div className="metrics-foot mono">
        <span>MEASURED / VERIFIED</span>
        <span>SECTION {String(index).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function Capabilities({
  section,
  index,
  editable,
  onEdit,
}: SectionProps & { section: CapabilitiesSection }) {
  return (
    <div className={`capabilities capabilities--${section.variant}`}>
      <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
      <div className="capability-list">
        {section.items.map((item, itemIndex) => (
          <article className="capability" key={`${item.title}-${itemIndex}`}>
            <span className="capability-index mono">{item.index}</span>
            <h3 className="capability-title">{item.title}</h3>
            <p className="capability-body">{item.body}</p>
            <span className="capability-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function Products({ section, index, editable, onEdit }: SectionProps & { section: ProductsSection }) {
  return (
    <div className={`products products--${section.variant}`}>
      <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
      {section.variant === 'index' ? (
        <div className="product-index">
          {section.items.map((product, itemIndex) => (
            <article className="product-row" key={product.id}>
              <span className="product-row-index mono">{String(itemIndex + 1).padStart(2, '0')}</span>
              <img
                className="media-framed"
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={cropVars(product.crop)}
              />
              <div className="product-row-main">
                <h3>{product.name}</h3>
                <span className="mono">{product.code}</span>
              </div>
              <p>{product.spec}</p>
              <div className="product-row-tags">
                {product.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <span className="product-row-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {section.items.map((product, itemIndex) => (
            <article
              className={`product-card ${section.variant === 'stage' && itemIndex === 0 ? 'product-card--feature' : ''}`}
              key={product.id}
            >
              <div className="product-image">
                <img
                  className="media-framed"
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  style={cropVars(product.crop)}
                />
                <span className="product-code mono">{product.code}</span>
                <span className="product-plus" aria-hidden="true">+</span>
              </div>
              <div className="product-body">
                <div className="product-heading">
                  <h3>{product.name}</h3>
                  <span className="mono">{String(itemIndex + 1).padStart(2, '0')}</span>
                </div>
                <p>{product.spec}</p>
                <div className="product-tags">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Process({ section, index, editable, onEdit }: SectionProps & { section: ProcessSection }) {
  return (
    <div className="process">
      <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
      <div className="process-track">
        {section.items.map((step, itemIndex) => (
          <article className="process-step" key={`${step.title}-${itemIndex}`}>
            <div className="process-step-top mono">
              <span>{step.index}</span>
              <span>{step.time}</span>
            </div>
            <span className="process-node" aria-hidden="true" />
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Proof({ section, index, editable, onEdit }: SectionProps & { section: ProofSection }) {
  return (
    <div className="proof">
      <div className="proof-main">
        <span className="proof-mark" aria-hidden="true">“</span>
        <blockquote>
          <p>{section.quote}</p>
        </blockquote>
        <div className="proof-author">
          <span className="proof-avatar" aria-hidden="true" />
          <div>
            <strong>{section.author}</strong>
            <span className="mono">{section.role}</span>
          </div>
        </div>
      </div>
      <aside className="proof-side">
        <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
        <div className="proof-stats">
          {section.stats.map((stat) => (
            <div className="proof-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="proof-clients mono">
          <span>SELECTED CLIENTS</span>
          <div>
            {section.clients.map((client) => (
              <span key={client}>{client}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Cta({ section, index, editable, onEdit }: SectionProps & { section: CtaSection }) {
  return (
    <div className="cta" style={section.media ? { '--cta-image': `url(${section.media.src})` } as CSSProperties : undefined}>
      {section.media && <div className="cta-image" aria-hidden="true" />}
      <div className="cta-top mono">
        <span>START A PROJECT</span>
        <span>{String(index).padStart(2, '0')} / 08</span>
      </div>
      <div className="cta-main">
        <div>
          <Eyebrow section={section} index={index} editable={editable} onEdit={onEdit} />
          <h2 className="cta-headline">{section.headline}</h2>
        </div>
        <div className="cta-side">
          <p>{section.body}</p>
          <div className="hero-ctas">
            <a className="btn btn--ink" href="mailto:hello@gantry.systems">
              {section.primaryCta}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="btn btn--ghost" href="#">
              {section.secondaryCta}
            </a>
          </div>
        </div>
      </div>
      <div className="cta-bottom mono">
        <span>RESPONSE WITHIN 24H</span>
        <span>SHENZHEN / CHINA</span>
      </div>
    </div>
  );
}

function Footer({ section, index }: SectionProps & { section: FooterSection }) {
  return (
    <div className="footer">
      <div className="footer-top">
        <h2 className="footer-brand">{section.title}</h2>
        <p className="footer-note">{section.note}</p>
      </div>
      <div className="footer-columns">
        {section.columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <span className="mono">{column.title}</span>
            {column.links.map((link) => (
              <a href="#" key={link}>{link}</a>
            ))}
          </div>
        ))}
        <div className="footer-column footer-column--contact">
          <span className="mono">CONTACT</span>
          <a href="mailto:hello@gantry.systems">hello@gantry.systems</a>
          <a href="tel:+8613800000000">+86 138 0000 0000</a>
        </div>
      </div>
      <div className="footer-bottom mono">
        <span>{section.legal}</span>
        <span>BUILT WITH THE GANTRY FOUNDRY / {String(index).padStart(2, '0')}</span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </div>
  );
}

export function Section({ section, index, editable, onEdit }: SectionProps) {
  const common = { section, index, editable, onEdit };
  let body: React.ReactNode;

  switch (section.type) {
    case 'metrics':
      body = <Metrics {...common} section={section} />;
      break;
    case 'capabilities':
      body = <Capabilities {...common} section={section} />;
      break;
    case 'products':
      body = <Products {...common} section={section} />;
      break;
    case 'process':
      body = <Process {...common} section={section} />;
      break;
    case 'proof':
      body = <Proof {...common} section={section} />;
      break;
    case 'cta':
      body = <Cta {...common} section={section} />;
      break;
    case 'footer':
      body = <Footer {...common} section={section} />;
      break;
    default:
      body = null;
  }

  if (!body) return null;

  return (
    <section
      id={section.id}
      className={`site-section site-section--${section.type}`}
      data-tone={section.tone ?? 'light'}
      data-section-id={section.id}
    >
      <div className="section-inner">{body}</div>
    </section>
  );
}
