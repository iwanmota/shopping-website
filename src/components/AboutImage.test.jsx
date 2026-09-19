import fs from 'fs';
import path from 'path';

const aboutComponent = fs.readFileSync(path.join(__dirname, 'About.jsx'), 'utf8');

test('About uses the approved packing image before the story and links to the catalogue', () => {
  const imagePath = '/images/about/concepts/packing-table.png';
  expect(fs.existsSync(path.join(__dirname, '../../public', imagePath))).toBe(true);
  expect(aboutComponent).toContain(imagePath);
  expect(aboutComponent.indexOf(imagePath)).toBeLessThan(aboutComponent.indexOf('className="about-story"'));
  expect(aboutComponent).toContain('to="/products"');
});
