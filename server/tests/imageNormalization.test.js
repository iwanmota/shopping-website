const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const { processUploadedImage, validateImageMetadata } = require('../utils/imageProcessing');
const { getAbsoluteImagePath } = require('../utils/fileStorage');

describe('processUploadedImage', () => {
  const generatedFiles = [];

  afterEach(async () => {
    await Promise.all(generatedFiles.splice(0).map(file => fs.promises.rm(file, { force: true })));
  });

  test('decodes an uploaded image and writes normalized WebP original and thumbnail files', async () => {
    const input = await sharp({ create: { width: 20, height: 10, channels: 3, background: '#3399cc' } }).png().toBuffer();

    const result = await processUploadedImage({ originalname: 'camera.png', mimetype: 'image/png', size: input.length, buffer: input });

    expect(result.success).toBe(true);
    expect(result.file).toMatchObject({ mimetype: 'image/webp' });
    expect(result.file.relativePath).toMatch(/^\/images\/products\/uploads\/.+\.webp$/);
    generatedFiles.push(result.file.absolutePath, result.file.thumbnailAbsolutePath);
    await expect(sharp(result.file.absolutePath).metadata()).resolves.toMatchObject({ format: 'webp' });
    await expect(sharp(result.file.thumbnailAbsolutePath).metadata()).resolves.toMatchObject({ format: 'webp' });
  });

  test('rejects images whose decoded dimensions exceed the pixel safety limit', () => {
    expect(validateImageMetadata({ width: 8000, height: 5001 })).toEqual({
      success: false,
      error: 'Image dimensions exceed the 40000000 pixel limit'
    });
  });

  test('rejects arbitrary bytes despite an image MIME type without writing files', async () => {
    const result = await processUploadedImage({
      originalname: 'spoofed.png', mimetype: 'image/png', size: 8, buffer: Buffer.from('not image')
    });

    expect(result).toMatchObject({ success: false });
    expect(result.error).toMatch(/Image validation failed|Input buffer/);
  });
});
