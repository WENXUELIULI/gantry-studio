import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Gallery } from './Gallery';
import { TEMPLATES } from '../../data/templates';

describe('Gallery', () => {
  it('renders the headline, counters and every template card', () => {
    render(<Gallery onOpen={vi.fn()} />);
    expect(
      screen.getByRole('heading', { name: /为工业/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      TEMPLATES.length,
    );
    expect(
      screen.getByText(`${TEMPLATES.length} TEMPLATES ONLINE`),
    ).toBeInTheDocument();
  });

  it('opens the selected template', () => {
    const onOpen = vi.fn();
    render(<Gallery onOpen={onOpen} />);
    fireEvent.click(
      screen.getByRole('button', { name: `使用模板 ${TEMPLATES[0].name}` }),
    );
    expect(onOpen).toHaveBeenCalledWith(TEMPLATES[0].id);
  });

  it('filters by industry', () => {
    render(<Gallery onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^玻璃与器皿/ }));
    const expected = TEMPLATES.filter(
      (template) => template.industry === 'glass',
    ).length;
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      expected,
    );
    expect(
      document.querySelector('.result-count')?.textContent?.replace(/\s+/g, ' '),
    ).toBe(`${String(expected).padStart(2, '0')} / ${TEMPLATES.length}`);
  });

  it('filters by market and keeps both libraries available', () => {
    render(<Gallery onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^国际市场/ }));
    const expected = TEMPLATES.filter(
      (template) => template.market === 'global',
    ).length;
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      expected,
    );
    expect(
      screen.getByRole('button', { name: '使用模板 ATLAS MACHINE WORKS' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^中国市场/ }));
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      TEMPLATES.filter((template) => template.market === 'cn').length,
    );
  });

  it('searches names, codes and tags', () => {
    render(<Gallery onOpen={vi.fn()} />);
    const search = screen.getByRole('textbox', { name: '搜索模板' });
    fireEvent.change(search, { target: { value: 'substrate' } });
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: '使用模板 基底半导体' }),
    ).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'SUB-04' } });
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(1);
  });

  it('shows an empty state and can reset every filter', () => {
    render(<Gallery onOpen={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: '搜索模板' }), {
      target: { value: '不存在的关键词' },
    });
    expect(screen.queryAllByRole('button', { name: /使用模板/ })).toHaveLength(0);
    expect(screen.getByText('没有找到这个组合。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '重置筛选' }));
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      TEMPLATES.length,
    );
  });

  it('combines industry and style filters', () => {
    render(<Gallery onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^机械与零件/ }));
    fireEvent.click(screen.getByRole('button', { name: /^工业编辑/ }));
    const expected = TEMPLATES.filter(
      (template) =>
        template.industry === 'machinery' &&
        template.style === 'industrial-editorial',
    ).length;
    expect(screen.getAllByRole('button', { name: /使用模板/ })).toHaveLength(
      expected,
    );
  });
});
