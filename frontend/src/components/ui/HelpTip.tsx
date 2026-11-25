import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

type Position = { top: number; left: number; above: boolean };

export function HelpTip({ text }: { text: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const [position, setPosition] = useState<Position | null>(null);

  const show = () => {
    const node = anchor.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 32);
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - width / 2),
      window.innerWidth - width - 16,
    );
    const above = rect.top > 170;
    setPosition({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left,
      above,
    });
  };

  return (
    <>
      <span
        ref={anchor}
        className="field-help"
        tabIndex={0}
        role="note"
        aria-label={text}
        aria-describedby={tooltipId}
        onMouseEnter={show}
        onMouseLeave={() => setPosition(null)}
        onFocus={show}
        onBlur={() => setPosition(null)}
      >
        <CircleHelp size={12} strokeWidth={1.8} aria-hidden="true" />
      </span>
      {position &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className={`field-tooltip${position.above ? ' is-above' : ''}`}
            style={{ top: position.top, left: position.left }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}
