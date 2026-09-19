import { filterProducts } from './catalogue';
const products = [
  {
    id: 1,
    name: 'Coffee Maker',
    description: 'Fresh mornings',
    isOnSale: 1,
    onSaleQuantity: 2,
  },
  {
    id: 2,
    name: 'Headphones',
    description: 'Wireless audio',
    isOnSale: 1,
    onSaleQuantity: 0,
  },
  {
    id: 3,
    name: 'Smart Watch',
    description: 'Fitness tracker',
    isOnSale: 0,
    onSaleQuantity: 5,
  },
  { id: 4, name: 'Desk lamp', category: 'Home', description: 'Reading light' },
];
test('offers exclude depleted and inactive sales', () => {
  expect(filterProducts(products, 'Sale', '').map((p) => p.id)).toEqual([1]);
});
test('search combines category and normalized name or description matching', () => {
  expect(
    filterProducts(products, 'Home', ' READING ').map((p) => p.id)
  ).toEqual([4]);
  expect(filterProducts(products, 'Tech', 'coffee')).toEqual([]);
  expect(filterProducts(products, 'All', '').length).toBe(4);
});
