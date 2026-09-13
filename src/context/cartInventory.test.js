import { getAvailableQuantity, getInventoryForTier, reconcileCartItems } from './cartInventory';

test('reads inventory from the selected pricing tier', () => {
  const product = { onSaleQuantity: 3, regularInventory: 20 };
  expect(getInventoryForTier(product, 'sale')).toBe(3);
  expect(getInventoryForTier(product, 'regular')).toBe(20);
});

test('subtracts the current cart quantity from available inventory', () => {
  const product = { id: 4, onSaleQuantity: 3, regularInventory: 20 };
  const cart = [{ id: 4, lineId: '4-sale', pricingTier: 'sale', quantity: 2 }];
  expect(getAvailableQuantity(product, 'sale', cart)).toBe(1);
});

test('removes unavailable lines and caps stale quantities', () => {
  const products = [{ id: 1, name: 'Watch', regularInventory: 2, onSaleQuantity: 0 }];
  const cart = [{ id: 1, lineId: '1-regular', pricingTier: 'regular', quantity: 5, price: 1 }];
  expect(reconcileCartItems(cart, products)[0].quantity).toBe(2);
  expect(reconcileCartItems([{ ...cart[0], pricingTier: 'sale', lineId: '1-sale' }], products)).toEqual([]);
});
