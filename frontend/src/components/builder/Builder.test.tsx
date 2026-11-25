import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Builder } from './Builder';
import { useBuilderStore } from '../../store/builder';

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
  });
  useBuilderStore.getState().openTemplate('truss-precision');
}

describe('Builder', () => {
  beforeEach(openProject);

  it('renders the page rail and switches the device shell', () => {
    const { container } = render(<Builder />);
    expect(container.querySelectorAll('.rail-section')).toHaveLength(8);
    expect(container.querySelector('.device-shell')).toHaveAttribute(
      'data-device',
      'desktop',
    );

    fireEvent.click(screen.getByRole('button', { name: '手机视图' }));
    expect(container.querySelector('.device-shell')).toHaveAttribute(
      'data-device',
      'mobile',
    );
  });

  it('scrolls the canvas to a section selected from the rail', () => {
    const { container } = render(<Builder />);
    const scroller = container.querySelector(
      '.device-screen .site-scroll',
    ) as HTMLElement;
    const scrollTo = vi.spyOn(scroller, 'scrollTo');
    const railSections = container.querySelectorAll('.rail-section');
    fireEvent.click(railSections[3]);

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
    expect(useBuilderStore.getState().selectedId).toBe(
      useBuilderStore.getState().doc?.sections[3].id,
    );
  });

  it('adds a section after choosing a type from the rail menu', () => {
    render(<Builder />);
    fireEvent.click(screen.getByRole('button', { name: /添加区块/ }));
    fireEvent.click(screen.getByRole('button', { name: '客户证言' }));
    expect(useBuilderStore.getState().doc?.sections).toHaveLength(9);
  });

  it('opens the preview dialog and closes it with Escape', () => {
    render(<Builder />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    expect(screen.getByRole('dialog', { name: '站点预览' })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog', { name: '站点预览' })).toBeNull();
  });

  it('returns to the template gallery and keeps the draft', () => {
    render(<Builder />);
    fireEvent.click(screen.getByRole('button', { name: '模板库' }));
    expect(useBuilderStore.getState().view).toBe('gallery');
    expect(useBuilderStore.getState().doc?.templateId).toBe('truss-precision');
  });

  it('jumps to the export tab from the top bar', () => {
    render(<Builder />);
    fireEvent.click(screen.getAllByRole('button', { name: '导出' })[0]);
    expect(screen.getByText('HTML / JSON / SINGLE FILE')).toBeInTheDocument();
  });
});
