import { cartReducer } from './CartContext';

test('keeps sale and regular pricing tiers as independent cart lines', () => {
  const product = { id: 7, price: 100, salePrice: 70, isOnSale: true, onSaleQuantity: 1, regularInventory: 20 };
  const saleCart = cartReducer([], { type: 'ADD_ITEM', payload: product });
  const cart = cartReducer(saleCart, { type: 'ADD_ITEM', payload: product });

  expect(cart).toEqual([
    expect.objectContaining({ lineId: '7-sale', quantity: 1, pricingTier: 'sale' }),
    expect.objectContaining({ lineId: '7-regular', quantity: 1, pricingTier: 'regular' })
  ]);
});

test('does not add a line when both pricing tiers are out of stock', () => {
  const product = { id: 8, price: 100, isOnSale: false, onSaleQuantity: 0, regularInventory: 0 };
  expect(cartReducer([], { type: 'ADD_ITEM', payload: product })).toEqual([]);
});

test('caps cart updates at inventory for the selected tier', () => {
  const item = { id: 9, lineId: '9-regular', pricingTier: 'regular', quantity: 1, regularInventory: 3 };
  const updated = cartReducer([item], { type: 'UPDATE_QUANTITY', payload: { lineId: '9-regular', quantity: 9 } });
  expect(updated[0].quantity).toBe(3);
});
