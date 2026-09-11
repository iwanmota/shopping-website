import fs from 'fs';
import path from 'path';

const headerCss = fs.readFileSync(path.join(__dirname, 'Header.css'), 'utf8');

test('logo uses the same maple red as active navigation buttons', () => {
  expect(headerCss).toMatch(/\.logo h1\s*\{[^}]*color:\s*var\(--maple-red\);/s);
});
