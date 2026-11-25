import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EditableText } from './EditableText';

function renderEditable(value = '原始标题', multiline = false) {
  const onCommit = vi.fn();
  render(
    <EditableText
      as="h1"
      value={value}
      editable
      multiline={multiline}
      onCommit={onCommit}
    />,
  );
  return { onCommit, node: screen.getByRole('textbox') };
}

describe('EditableText', () => {
  it('renders the value and exposes an editable textbox', () => {
    const { node } = renderEditable();
    expect(node.tagName).toBe('H1');
    expect(node).toHaveTextContent('原始标题');
    expect(node).toHaveAttribute('contenteditable', 'true');
    expect(node).toHaveAttribute('data-editable', 'true');
  });

  it('commits trimmed text on blur', () => {
    const { onCommit, node } = renderEditable();
    node.innerText = '  新标题  ';
    fireEvent.blur(node);
    expect(onCommit).toHaveBeenCalledWith('新标题');
  });

  it('restores the old value when the edit is blank', () => {
    const { onCommit, node } = renderEditable();
    node.innerText = '   ';
    fireEvent.blur(node);
    expect(onCommit).not.toHaveBeenCalled();
    expect(node.innerText).toBe('原始标题');
  });

  it('commits on Enter for single-line fields', () => {
    const { onCommit, node } = renderEditable();
    node.focus();
    node.innerText = '单行标题';
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('单行标题');
  });

  it('keeps Enter inside multiline fields', () => {
    const { onCommit, node } = renderEditable('第一行\n第二行', true);
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('restores the original value on Escape without committing', () => {
    const { onCommit, node } = renderEditable();
    node.innerText = '不要保存';
    fireEvent.keyDown(node, { key: 'Escape' });
    expect(node.innerText).toBe('原始标题');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('applies an external undo while the field is still focused', () => {
    const onCommit = vi.fn();
    const { rerender } = render(
      <EditableText as="h1" value="原始标题" editable onCommit={onCommit} />,
    );
    const node = screen.getByRole('textbox');
    fireEvent.focus(node);
    node.innerText = '输入中的标题';
    fireEvent.input(node);

    rerender(<EditableText as="h1" value="撤销后的标题" editable onCommit={onCommit} />);

    expect(node.textContent).toBe('撤销后的标题');
  });

  it('renders a plain element when editing is disabled', () => {
    const onCommit = vi.fn();
    render(
      <EditableText
        as="p"
        value="只读文本"
        editable={false}
        onCommit={onCommit}
      />,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('只读文本')).toBeInTheDocument();
  });
});
