import fs from 'fs';
import path from 'path';

const homepageCss = fs.readFileSync(path.join(__dirname, 'Homepage.css'), 'utf8');

test('homepage hero uses an abstract dark treatment without the storefront image', () => {
  const bannerRule = homepageCss.match(/\.sale-banner\s*\{([\s\S]*?)\}/)?.[1] || '';
  expect(bannerRule).not.toMatch(/url\(/);
  expect(bannerRule).toMatch(/radial-gradient/);
});
