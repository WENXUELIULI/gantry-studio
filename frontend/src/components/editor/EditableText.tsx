import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { InlineEditContext } from './inlineEdit';

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
  const focused = useRef(false);
  const startValue = useRef(value);
  const [rendered, setRendered] = useState(value);
  const edit = useContext(InlineEditContext);

  useEffect(() => {
    if (focused.current && ref.current) {
      const current = readText(ref.current).replace(/\u00a0/g, ' ').trim();
      if (current === value) return;
      ref.current.textContent = value;
      setRendered(value);
      return;
    }
    setRendered(value);
    if (editable && ref.current) ref.current.textContent = value;
  }, [editable, value]);

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
      onClick={(event) => {
        if (editable && event.currentTarget.closest('a')) event.preventDefault();
      }}
      onFocus={() => {
        if (!editable) return;
        focused.current = true;
        startValue.current = value;
        edit?.begin();
      }}
      onInput={(event) => {
        if (!editable || !onCommit) return;
        const next = readText(event.currentTarget).replace(/\u00a0/g, ' ').trim();
        if (!next) return;
        if (next !== value) onCommit(next);
      }}
      onBlur={(event) => {
        if (!editable || !onCommit) return;
        focused.current = false;
        const next = readText(event.currentTarget).replace(/\u00a0/g, ' ').trim();
        if (next && next !== value) onCommit(next);
        else {
          if (typeof event.currentTarget.innerText === 'string') {
            event.currentTarget.innerText = value;
          } else {
            event.currentTarget.textContent = value;
          }
        }
        setRendered(next || value);
        edit?.end();
      }}
      onKeyDown={(event) => {
        if (!editable) return;
        if (event.key === 'Enter' && !multiline) {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          if (onCommit && startValue.current !== value) onCommit(startValue.current);
          setRendered(startValue.current);
          if (typeof event.currentTarget.innerText === 'string') {
            event.currentTarget.innerText = startValue.current;
          } else {
            event.currentTarget.textContent = startValue.current;
          }
          focused.current = false;
          edit?.end();
          event.currentTarget.blur();
        }
      }}
    >
      {editable ? null : rendered}
    </Tag>
  );
}
