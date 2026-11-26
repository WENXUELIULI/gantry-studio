import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { INDUSTRIES, MARKETS } from '../../data/taxonomy';
import { THEMES } from '../../data/themes';
import { LOCALES, DEFAULT_LOCALE } from '../../i18n/locales';
import type { BlankDocumentOptions } from '../../lib/site';

interface BlankStartDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (options: BlankDocumentOptions) => void;
}

export function BlankStartDialog({ open, onClose, onCreate }: BlankStartDialogProps) {
  const [name, setName] = useState('未命名官网');
  const [market, setMarket] = useState<BlankDocumentOptions['market']>('cn');
  const [locale, setLocale] = useState<BlankDocumentOptions['locale']>(DEFAULT_LOCALE);
  const [industry, setIndustry] = useState<BlankDocumentOptions['industry']>('machinery');
  const [themeId, setThemeId] = useState('hot-rolled');

  if (!open) return null;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({
      name: name.trim() || '未命名官网',
      market,
      locale,
      industry,
      themeId,
    });
  };

  return (
    <div className="blank-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="blank-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="从空白开始"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="blank-dialog-head">
          <div>
            <span className="mono">BLANK START / 00</span>
            <h2>从一张白纸开始。</h2>
            <p>先确定语境，再自己挑首屏、区块和节奏。不会套任何模板。</p>
          </div>
          <button type="button" className="blank-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <label className="field">
          <span>项目名称 / NAME</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：恒锻精工官网"
            autoFocus
          />
        </label>

        <div className="blank-grid">
          <label className="field">
            <span>市场 / MARKET</span>
            <select
              value={market}
              onChange={(event) => setMarket(event.target.value as BlankDocumentOptions['market'])}
            >
              {MARKETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} / {item.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>语言 / LOCALE</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as BlankDocumentOptions['locale'])}
            >
              {LOCALES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.nativeName} · {item.code}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>行业 / INDUSTRY</span>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value as BlankDocumentOptions['industry'])}
            >
              {INDUSTRIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} / {item.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>主题 / THEME</span>
            <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
              {THEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} / {item.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="blank-foot">
          <span className="mono">行业和主题只改变默认语气，进入后都能改。</span>
          <button type="submit" className="blank-submit">
            进入空白画布
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
