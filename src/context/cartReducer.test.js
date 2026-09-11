import { cartReducer } from './CartContext';

const product = {
  id: 1,
  name: 'Coffee Maker',
  price: 199.99,
  salePrice: 149.99,
  isOnSale: 1,
  onSaleQuantity: 1,
  regularInventory: 5
};

const add = (state) => cartReducer(state, { type: 'ADD_ITEM', payload: product });

test('sale and regular versions of a product receive distinct cart line identifiers', () => {
  const state = add(add([]));
  expect(state.map(item => item.lineId)).toEqual(['1-sale', '1-regular']);
});

test('updates only the selected pricing tier', () => {
  const state = add(add([]));
  const updated = cartReducer(state, {
    type: 'UPDATE_QUANTITY',
    payload: { lineId: '1-regular', quantity: 2 }
  });

  expect(updated.find(item => item.lineId === '1-sale').quantity).toBe(1);
  expect(updated.find(item => item.lineId === '1-regular').quantity).toBe(2);
});

test('removes only the selected pricing tier', () => {
  const state = add(add([]));
  const updated = cartReducer(state, { type: 'REMOVE_ITEM', payload: '1-sale' });
  expect(updated.map(item => item.lineId)).toEqual(['1-regular']);
});
