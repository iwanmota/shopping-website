import fs from 'fs';
import path from 'path';

const productCardCss = fs.readFileSync(path.join(__dirname, 'ProductCard.css'), 'utf8');

test('pushes add to cart buttons to the bottom of equal-height cards', () => {
  expect(productCardCss).toMatch(/\.add-to-cart-button\s*\{[^}]*margin-top:\s*auto;/s);
});
