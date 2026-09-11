import fs from 'fs';
import path from 'path';

const cartModalCss = fs.readFileSync(
  path.join(__dirname, 'CartModal.css'),
  'utf8'
);

test('cart modal height includes its padding so the checkout button stays visible', () => {
  expect(cartModalCss).toMatch(
    /\.modal-content\s*\{[^}]*box-sizing:\s*border-box;/s
  );
});
