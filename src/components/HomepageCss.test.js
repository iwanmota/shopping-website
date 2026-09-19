import fs from 'fs';
import path from 'path';

const homepageCss = fs.readFileSync(path.join(__dirname, 'Homepage.css'), 'utf8');

test('homepage avoids viewport-height heroes that push products off phone screens', () => {
  expect(homepageCss).not.toMatch(/min-height:\s*\d+vh/);
  expect(homepageCss).toMatch(/@media\s*\(max-width:\s*600px\)/);
});
