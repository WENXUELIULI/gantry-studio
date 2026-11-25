import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Inspector } from './Inspector';
import { useBuilderStore } from '../../store/builder';
import type { HeroSection } from '../../types/site';

function openProject() {
  localStorage.clear();
  useBuilderStore.setState({
    doc: null,
    view: 'gallery',
    selectedId: null,
    device: 'desktop',
    zoom: 0.72,
    history: [],
    future: [],
    savedAt: null,
    editSectionId: null,
    editBaseline: null,
  });
  useBuilderStore.getState().openTemplate('truss-precision');
  return useBuilderStore.getState().doc;
}

function select(id: string) {
  act(() => useBuilderStore.getState().selectSection(id));
}

describe('Inspector', () => {
  beforeEach(() => {
    openProject();
    select('hero');
  });

  it('edits hero content through labeled fields', () => {
    render(<Inspector tab="content" onTab={vi.fn()} />);
    const location = screen.getByLabelText('地点 / 编号');
    fireEvent.change(location, { target: { value: '江苏 · 苏州' } });
    fireEvent.blur(location);

    const hero = useBuilderStore.getState().doc?.sections[0] as HeroSection;
    expect(hero.location).toBe('江苏 · 苏州');
  });

  it('switches the hero narrative system', () => {
    render(<Inspector tab="content" onTab={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('首屏叙事'), {
      target: { value: 'product-stage' },
    });
    const hero = useBuilderStore.getState().doc?.sections[0] as HeroSection;
    expect(hero.heroKind).toBe('product-stage');
  });

  it('edits a generic section title and refuses blank titles', () => {
    select('metrics');
    render(<Inspector tab="content" onTab={vi.fn()} />);
    const title = screen.getByLabelText('标题 / TITLE');
    fireEvent.change(title, { target: { value: '新的数字标题' } });
    fireEvent.blur(title);
    expect(useBuilderStore.getState().doc?.sections[1].title).toBe(
      '新的数字标题',
    );

    fireEvent.change(title, { target: { value: '   ' } });
    fireEvent.blur(title);
    expect(useBuilderStore.getState().doc?.sections[1].title).toBe(
      '新的数字标题',
    );
  });

  it('previews title edits before blur and coalesces undo history', () => {
    select('metrics');
    const original = useBuilderStore.getState().doc?.sections[1].title;
    render(<Inspector tab="content" onTab={vi.fn()} />);
    const title = screen.getByLabelText('标题 / TITLE');

    fireEvent.focus(title);
    fireEvent.change(title, { target: { value: '实时' } });
    expect(useBuilderStore.getState().doc?.sections[1].title).toBe('实时');
    fireEvent.change(title, { target: { value: '实时联动' } });
    expect(useBuilderStore.getState().doc?.sections[1].title).toBe('实时联动');
    expect(useBuilderStore.getState().history).toHaveLength(0);

    fireEvent.blur(title);
    expect(useBuilderStore.getState().history).toHaveLength(1);
    act(() => useBuilderStore.getState().undo());
    expect(useBuilderStore.getState().doc?.sections[1].title).toBe(original);
  });

  it('duplicates and removes a section from the header actions', () => {
    render(<Inspector tab="content" onTab={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '复制区块' }));
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(9);

    select('metrics');
    fireEvent.click(screen.getByRole('button', { name: '删除区块' }));
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(8);

    select('hero');
    expect(screen.getByRole('button', { name: '删除区块' })).toBeDisabled();
  });

  it('applies a preset theme', () => {
    render(<Inspector tab="theme" onTab={vi.fn()} />);
    expect(screen.getByText('热轧钢 / hot-rolled')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^熔融玻璃/ }));
    expect(useBuilderStore.getState().doc?.theme.id).toBe('molten-glass');
  });

  it('restores the original template theme', () => {
    render(<Inspector tab="theme" onTab={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^熔融玻璃/ }));
    fireEvent.click(screen.getByRole('button', { name: '恢复模板主题' }));
    expect(useBuilderStore.getState().doc?.theme.id).toBe('hot-rolled');
  });

  it('gates source JSON behind the demo Pro entitlement', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(
      <Inspector tab="export" onTab={vi.fn()} />,
    );

    const stats = container.querySelectorAll('.export-stat strong');
    expect(stats[0]).toHaveTextContent('8');
    expect(stats[1]).toHaveTextContent('589');
    expect(screen.getByRole('button', { name: /项目源文件 · Pro/ })).toBeDisabled();
    expect(screen.getByText('Free · HTML 发布免费')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /解锁 Pro/ }));
    expect(screen.getByText('Pro · 源文件导出已解锁')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /复制项目源文件/ }));

    await waitFor(() =>
      expect(screen.getByText('项目源文件已复制。')).toBeInTheDocument(),
    );
    expect(writeText).toHaveBeenCalledOnce();
    expect(JSON.parse(writeText.mock.calls[0][0])).toMatchObject({
      templateId: 'truss-precision',
    });
  });

  it('edits section-level layout styles from schema controls', () => {
    select('products');
    render(<Inspector tab="content" onTab={vi.fn()} />);

    expect(
      screen.getByRole('note', { name: /滚动进入视口时的节奏/ }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('区块布局'), {
      target: { value: 'split' },
    });
    fireEvent.change(screen.getByLabelText('区块密度'), {
      target: { value: 'compact' },
    });
    fireEvent.change(screen.getByLabelText('区块列数'), {
      target: { value: '2' },
    });

    const readStyle = () =>
      useBuilderStore
        .getState()
        .doc?.sections.find((section) => section.id === 'products')?.style;

    expect(readStyle()).toMatchObject({
      layout: 'split',
      density: 'compact',
      columns: 2,
    });

    fireEvent.click(screen.getByRole('button', { name: '重置区块样式' }));
    expect(readStyle()).toBeUndefined();
  });

  it('sets a focal point and zoom for the hero image', () => {
    render(<Inspector tab="content" onTab={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/焦点 X/), {
      target: { value: '24' },
    });
    fireEvent.change(screen.getByLabelText(/缩放/), {
      target: { value: '1.5' },
    });

    const hero = useBuilderStore.getState().doc?.sections[0] as HeroSection;
    expect(hero.media.crop).toMatchObject({ x: 24, zoom: 1.5 });
    expect(hero.media.crop?.y).toBe(50);
  });

  it('renders an empty state when no section is selected', () => {
    select('');
    render(<Inspector tab="content" onTab={vi.fn()} />);
    expect(screen.getByText('选择一个区块')).toBeInTheDocument();
  });
});
