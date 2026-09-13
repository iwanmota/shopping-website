import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageModal from './ImageModal';

describe('ImageModal accessibility', () => {
  test('exposes a dialog and closes when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <ImageModal
        image="/images/products/example.jpg"
        alt="Example product"
        isOpen
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
