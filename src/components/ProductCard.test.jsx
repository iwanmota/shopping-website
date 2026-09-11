import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductCard from './ProductCard';
import { CartProvider } from '../context/CartContext';

const regularProduct = {
  id: 3,
  name: 'Smart Watch',
  price: 299.99,
  description: 'Fitness tracking and notifications',
  image: '/images/products/smartwatch.jpg',
  isOnSale: 0,
  salePrice: null,
  onSaleQuantity: 0
};

test('does not render the numeric sale flag for a regular product', () => {
  const html = renderToStaticMarkup(
    <CartProvider>
      <ProductCard
        product={regularProduct}
        onImageClick={() => {}}
        showToast={() => {}}
      />
    </CartProvider>
  );

  expect(html).not.toContain('<div class="product-card">0');
  expect(html).toContain('$299.99');
});
