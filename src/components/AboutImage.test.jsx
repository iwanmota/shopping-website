import fs from 'fs';
import path from 'path';

const aboutComponent = fs.readFileSync(
  path.join(__dirname, 'About.jsx'),
  'utf8'
);
const aboutCss = fs.readFileSync(path.join(__dirname, 'About.css'), 'utf8');

test('about page uses the new wide storefront image without forcing a portrait crop', () => {
  expect(aboutComponent).toContain('/images/about/store-front-2.png');
  expect(aboutCss).toMatch(
    /\.about-image\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9;/s
  );
  expect(aboutCss).toMatch(/\.about-image img\s*\{[^}]*height:\s*100%;/s);
});
