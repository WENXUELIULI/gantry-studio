import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ImageCropper from './ImageCropper';

describe('ImageCropper', () => {
  it('applies a zoomed focal point', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <ImageCropper
        src="/assets/factory-01.jpg"
        crop={{ x: 50, y: 50, zoom: 1 }}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: '裁剪图片' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/缩放/), { target: { value: '1.8' } });
    fireEvent.change(screen.getByLabelText(/横向焦点/), { target: { value: '32' } });
    await user.click(screen.getByRole('button', { name: /应用焦点/ }));

    expect(onApply).toHaveBeenCalledWith({ x: 32, y: 50, zoom: 1.8 });
  });

  it('resets and closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ImageCropper
        src="/assets/factory-01.jpg"
        crop={{ x: 20, y: 80, zoom: 2 }}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: /重置/ }));
    expect(screen.getByText('1.00×')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
