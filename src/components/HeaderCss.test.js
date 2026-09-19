import fs from 'fs';
import path from 'path';

const headerCss = fs.readFileSync(path.join(__dirname, 'Header.css'), 'utf8');

test('header keeps navigation and account controls accessible on narrow screens', () => {
  expect(headerCss).toMatch(/\.main-nav\s*\{[^}]*order:\s*3;/s);
  expect(headerCss).toMatch(/\.header-content\s*\{[^}]*flex-wrap:\s*wrap;/s);
});
