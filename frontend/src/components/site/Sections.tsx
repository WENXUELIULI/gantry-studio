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
  onEdit?: (field: string, value: unknown) => void;
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

function Metrics({ section, index, editable, onEdit }: SectionProps & { section: MetricsSection }) {
  const update = (itemIndex: number, patch: Partial<MetricsSection['items'][number]>) =>
    onEdit?.(
      'items',
      section.items.map((item, current) =>
        current === itemIndex ? { ...item, ...patch } : item,
      ),
    );

  return (
    <div className="metrics-grid">
      {section.items.map((item, itemIndex) => (
        <article className="metric" key={itemIndex}>
          <EditableText
            as="div"
            className="metric-value"
            value={item.value}
            editable={editable}
            onCommit={(value) => update(itemIndex, { value })}
          />
          <EditableText
            as="div"
            className="metric-label"
            value={item.label}
            editable={editable}
            onCommit={(value) => update(itemIndex, { label: value })}
          />
          {item.note && (
            <EditableText
              as="div"
              className="metric-note mono"
              value={item.note}
              editable={editable}
              onCommit={(value) => update(itemIndex, { note: value })}
            />
          )}
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
  const update = (itemIndex: number, patch: Partial<CapabilitiesSection['items'][number]>) =>
    onEdit?.(
      'items',
      section.items.map((item, current) =>
        current === itemIndex ? { ...item, ...patch } : item,
      ),
    );

  return (
    <div className={`capabilities capabilities--${section.variant}`}>
      <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
      <div className="capability-list">
        {section.items.map((item, itemIndex) => (
          <article className="capability" key={itemIndex}>
            <span className="capability-index mono">{item.index}</span>
            <EditableText
              as="h3"
              className="capability-title"
              value={item.title}
              editable={editable}
              onCommit={(value) => update(itemIndex, { title: value })}
            />
            <EditableText
              as="p"
              className="capability-body"
              value={item.body}
              editable={editable}
              multiline
              onCommit={(value) => update(itemIndex, { body: value })}
            />
            <span className="capability-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function Products({ section, index, editable, onEdit }: SectionProps & { section: ProductsSection }) {
  const update = (itemIndex: number, patch: Partial<ProductsSection['items'][number]>) =>
    onEdit?.(
      'items',
      section.items.map((product, current) =>
        current === itemIndex ? { ...product, ...patch } : product,
      ),
    );

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
                <EditableText
                  as="h3"
                  value={product.name}
                  editable={editable}
                  onCommit={(value) => update(itemIndex, { name: value })}
                />
                <span className="mono">{product.code}</span>
              </div>
              <EditableText
                as="p"
                value={product.spec}
                editable={editable}
                multiline
                onCommit={(value) => update(itemIndex, { spec: value })}
              />
              <div className="product-row-tags">
                {product.tags.map((tag, tagIndex) => (
                  <EditableText
                    as="span"
                    key={`${product.id}-tag-${tagIndex}`}
                    value={tag}
                    editable={editable}
                    onCommit={(value) =>
                      update(itemIndex, {
                        tags: product.tags.map((currentTag, currentIndex) =>
                          currentIndex === tagIndex ? value : currentTag,
                        ),
                      })
                    }
                  />
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
                  <EditableText
                    as="h3"
                    value={product.name}
                    editable={editable}
                    onCommit={(value) => update(itemIndex, { name: value })}
                  />
                  <span className="mono">{String(itemIndex + 1).padStart(2, '0')}</span>
                </div>
                <EditableText
                  as="p"
                  value={product.spec}
                  editable={editable}
                  multiline
                  onCommit={(value) => update(itemIndex, { spec: value })}
                />
                <div className="product-tags">
                  {product.tags.map((tag, tagIndex) => (
                    <EditableText
                      as="span"
                      key={`${product.id}-tag-${tagIndex}`}
                      value={tag}
                      editable={editable}
                      onCommit={(value) =>
                        update(itemIndex, {
                          tags: product.tags.map((currentTag, currentIndex) =>
                            currentIndex === tagIndex ? value : currentTag,
                          ),
                        })
                      }
                    />
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
  const update = (itemIndex: number, patch: Partial<ProcessSection['items'][number]>) =>
    onEdit?.(
      'items',
      section.items.map((step, current) =>
        current === itemIndex ? { ...step, ...patch } : step,
      ),
    );

  return (
    <div className="process">
      <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
      <div className="process-track">
        {section.items.map((step, itemIndex) => (
          <article className="process-step" key={itemIndex}>
            <div className="process-step-top mono">
              <span>{step.index}</span>
              <EditableText
                as="span"
                value={step.time}
                editable={editable}
                onCommit={(value) => update(itemIndex, { time: value })}
              />
            </div>
            <span className="process-node" aria-hidden="true" />
            <EditableText
              as="h3"
              value={step.title}
              editable={editable}
              onCommit={(value) => update(itemIndex, { title: value })}
            />
            <EditableText
              as="p"
              value={step.body}
              editable={editable}
              multiline
              onCommit={(value) => update(itemIndex, { body: value })}
            />
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
          <EditableText
            as="p"
            value={section.quote}
            editable={editable}
            multiline
            onCommit={(value) => onEdit?.('quote', value)}
          />
        </blockquote>
        <div className="proof-author">
          <span className="proof-avatar" aria-hidden="true" />
          <div>
            <strong>
              <EditableText
                as="span"
                value={section.author}
                editable={editable}
                onCommit={(value) => onEdit?.('author', value)}
              />
            </strong>
            <EditableText
              as="span"
              className="mono"
              value={section.role}
              editable={editable}
              onCommit={(value) => onEdit?.('role', value)}
            />
          </div>
        </div>
      </div>
      <aside className="proof-side">
        <SectionHead section={section} index={index} editable={editable} onEdit={onEdit} />
        <div className="proof-stats">
          {section.stats.map((stat, statIndex) => (
            <div className="proof-stat" key={statIndex}>
              <strong>
                <EditableText
                  as="span"
                  value={stat.value}
                  editable={editable}
                  onCommit={(value) =>
                    onEdit?.(
                      'stats',
                      section.stats.map((current, currentIndex) =>
                        currentIndex === statIndex ? { ...current, value } : current,
                      ),
                    )
                  }
                />
              </strong>
              <EditableText
                as="span"
                value={stat.label}
                editable={editable}
                onCommit={(value) =>
                  onEdit?.(
                    'stats',
                    section.stats.map((current, currentIndex) =>
                      currentIndex === statIndex ? { ...current, label: value } : current,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="proof-clients mono">
          <span>SELECTED CLIENTS</span>
          <div>
            {section.clients.map((client, clientIndex) => (
              <EditableText
                as="span"
                key={clientIndex}
                value={client}
                editable={editable}
                onCommit={(value) =>
                  onEdit?.(
                    'clients',
                    section.clients.map((current, currentIndex) =>
                      currentIndex === clientIndex ? value : current,
                    ),
                  )
                }
              />
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
          <EditableText
            as="h2"
            className="cta-headline"
            value={section.headline}
            editable={editable}
            multiline
            onCommit={(value) => onEdit?.('headline', value)}
          />
        </div>
        <div className="cta-side">
          <EditableText
            as="p"
            value={section.body}
            editable={editable}
            multiline
            onCommit={(value) => onEdit?.('body', value)}
          />
          <div className="hero-ctas">
            <a className="btn btn--ink" href="mailto:hello@gantry.systems">
              <EditableText
                as="span"
                value={section.primaryCta}
                editable={editable}
                onCommit={(value) => onEdit?.('primaryCta', value)}
              />
              <span aria-hidden="true">↗</span>
            </a>
            <a className="btn btn--ghost" href="#">
              <EditableText
                as="span"
                value={section.secondaryCta}
                editable={editable}
                onCommit={(value) => onEdit?.('secondaryCta', value)}
              />
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

function Footer({ section, index, editable, onEdit }: SectionProps & { section: FooterSection }) {
  return (
    <div className="footer">
      <div className="footer-top">
        <EditableText
          as="h2"
          className="footer-brand"
          value={section.title}
          editable={editable}
          onCommit={(value) => onEdit?.('title', value)}
        />
        <EditableText
          as="p"
          className="footer-note"
          value={section.note}
          editable={editable}
          multiline
          onCommit={(value) => onEdit?.('note', value)}
        />
      </div>
      <div className="footer-columns">
        {section.columns.map((column, columnIndex) => (
          <div className="footer-column" key={columnIndex}>
            <EditableText
              as="span"
              className="mono"
              value={column.title}
              editable={editable}
              onCommit={(value) =>
                onEdit?.(
                  'columns',
                  section.columns.map((current, currentIndex) =>
                    currentIndex === columnIndex ? { ...current, title: value } : current,
                  ),
                )
              }
            />
            {column.links.map((link, linkIndex) => (
              <a href="#" key={linkIndex}>
                <EditableText
                  as="span"
                  value={link}
                  editable={editable}
                  onCommit={(value) =>
                    onEdit?.(
                      'columns',
                      section.columns.map((current, currentIndex) =>
                        currentIndex === columnIndex
                          ? {
                              ...current,
                              links: current.links.map((currentLink, currentLinkIndex) =>
                                currentLinkIndex === linkIndex ? value : currentLink,
                              ),
                            }
                          : current,
                      ),
                    )
                  }
                />
              </a>
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
        <EditableText
          as="span"
          value={section.legal}
          editable={editable}
          onCommit={(value) => onEdit?.('legal', value)}
        />
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
