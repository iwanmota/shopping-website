import { loadCart, saveCart } from './cartStorage';

const line = {
  id: 1,
  name: 'Maple mug',
  image: '/mug.jpg',
  price: 15,
  quantity: 2,
  pricingTier: 'sale',
  lineId: '1-sale',
};
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

test('restores separate price tiers and persists an emptied bag', () => {
  saveCart([
    line,
    {
      ...line,
      price: 20,
      quantity: 1,
      pricingTier: 'regular',
      lineId: '1-regular',
    },
  ]);
  expect(loadCart()).toEqual([
    { ...line, isOnSale: true },
    {
      ...line,
      price: 20,
      quantity: 1,
      pricingTier: 'regular',
      lineId: '1-regular',
      isOnSale: false,
    },
  ]);
  saveCart([]);
  expect(loadCart()).toEqual([]);
});

test('ignores corrupted, unsupported and invalid stored items', () => {
  localStorage.setItem('shopsmart.bag.v1', '{bad json');
  expect(loadCart()).toEqual([]);
  localStorage.setItem(
    'shopsmart.bag.v1',
    JSON.stringify({ version: 2, items: [line] })
  );
  expect(loadCart()).toEqual([]);
  localStorage.setItem(
    'shopsmart.bag.v1',
    JSON.stringify({
      version: 1,
      items: [
        null,
        { ...line, quantity: -1 },
        { ...line, price: '15' },
        line,
        line,
      ],
    })
  );
  expect(loadCart()).toEqual([{ ...line, isOnSale: true }]);
});

test('storage restrictions do not break reading or updating the bag', () => {
  vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
    throw new Error('Storage blocked');
  });
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('Quota exceeded');
  });
  expect(loadCart()).toEqual([]);
  expect(() => saveCart([line])).not.toThrow();
});
