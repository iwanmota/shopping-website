const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateUploadedImage } = require('../utils/imageProcessing');

describe('validateUploadedImage', () => {
  const tempFiles = [];

  afterEach(() => {
    tempFiles.splice(0).forEach(filePath => fs.rmSync(filePath, { force: true }));
  });

  test('rejects a file whose contents do not match its declared image type', () => {
    const filePath = path.join(os.tmpdir(), `not-an-image-${process.pid}.png`);
    tempFiles.push(filePath);
    fs.writeFileSync(filePath, 'plain text pretending to be an image');

    expect(validateUploadedImage({
      path: filePath,
      mimetype: 'image/png',
      size: fs.statSync(filePath).size
    })).toEqual(expect.objectContaining({
      success: false,
      errors: expect.arrayContaining(['File content does not match its declared image type'])
    }));
  });

  test('accepts a PNG whose signature matches its declared image type', () => {
    const filePath = path.join(os.tmpdir(), `valid-signature-${process.pid}.png`);
    tempFiles.push(filePath);
    fs.writeFileSync(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    expect(validateUploadedImage({
      path: filePath,
      mimetype: 'image/png',
      size: 8
    }).success).toBe(true);
  });
});
