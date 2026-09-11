import fs from 'fs';
import path from 'path';

const headerCss = fs.readFileSync(path.join(__dirname, 'Header.css'), 'utf8');

test('header uses the shared cinematic palette tokens', () => {
  expect(headerCss).toMatch(/\.logo h1\s*\{[^}]*color:\s*var\(--text-bright\);/s);
  expect(headerCss).toMatch(/\.main-nav a::after[^}]*background:\s*var\(--accent\);/s);
});
