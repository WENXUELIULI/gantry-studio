import { useEffect, useRef } from 'react';

interface EditableTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  value: string;
  editable: boolean;
  className?: string;
  multiline?: boolean;
  onCommit?: (value: string) => void;
}

function readText(node: HTMLElement): string {
  return typeof node.innerText === 'string' ? node.innerText : node.textContent ?? '';
}

export function EditableText({
  as = 'p',
  value,
  editable,
  className,
  multiline = false,
  onCommit,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    if (readText(node) === value) return;
    if (typeof node.innerText === 'string') node.innerText = value;
    else node.textContent = value;
  }, [value]);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      role={editable ? 'textbox' : undefined}
      aria-multiline={editable ? multiline : undefined}
      data-editable={editable ? 'true' : undefined}
      onBlur={(event) => {
        if (!editable || !onCommit) return;
        const next = readText(event.currentTarget).replace(/\u00a0/g, ' ').trim();
        if (next && next !== value) onCommit(next);
        else {
          if (typeof event.currentTarget.innerText === 'string') {
            event.currentTarget.innerText = value;
          } else {
            event.currentTarget.textContent = value;
          }
        }
      }}
      onKeyDown={(event) => {
        if (!editable) return;
        if (event.key === 'Enter' && !multiline) {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          if (typeof event.currentTarget.innerText === 'string') {
            event.currentTarget.innerText = value;
          } else {
            event.currentTarget.textContent = value;
          }
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}
