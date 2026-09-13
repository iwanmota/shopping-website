const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  ensureDirectoriesExist,
  generateUniqueFilename,
  getAbsoluteImagePath,
  getRelativeImagePath,
  extractFilenameFromPath
} = require('./fileStorage');

const IMAGE_SIGNATURES = {
  'image/jpeg': buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': buffer => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': buffer => buffer.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/) !== null,
  'image/webp': buffer => buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
};

const readFileBuffer = file => file.buffer || (file.path && fs.readFileSync(file.path));

const validateUploadedImage = file => {
  if (!file) return { success: false, errors: ['No file provided'] };
  try {
    const buffer = readFileBuffer(file);
    const signatureValidator = IMAGE_SIGNATURES[file.mimetype];
    if (!buffer || !signatureValidator || !signatureValidator(buffer)) {
      return { success: false, errors: ['File content does not match its declared image type'] };
    }
    return { success: true, errors: [] };
  } catch {
    return { success: false, errors: ['Uploaded file not found'] };
  }
};

const MAX_IMAGE_PIXELS = 40_000_000;

const validateImageMetadata = metadata => {
  const pixels = metadata.width * metadata.height;
  if (!Number.isSafeInteger(pixels) || pixels > MAX_IMAGE_PIXELS) {
    return { success: false, error: `Image dimensions exceed the ${MAX_IMAGE_PIXELS} pixel limit` };
  }
  return { success: true };
};

const processUploadedImage = async file => {
  const validation = validateUploadedImage(file);
  if (!validation.success) return { success: false, error: `Image validation failed: ${validation.errors.join(', ')}` };

  let originalPath;
  let thumbnailPath;
  try {
    const buffer = readFileBuffer(file);
    const metadata = await sharp(buffer, { animated: false, limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
    const metadataValidation = validateImageMetadata(metadata);
    if (!metadataValidation.success) return { success: false, error: metadataValidation.error };
    await ensureDirectoriesExist();

    const filename = generateUniqueFilename(path.parse(file.originalname || 'upload').name + '.webp');
    originalPath = getAbsoluteImagePath(filename);
    thumbnailPath = getAbsoluteImagePath(filename, 'thumbnail');
    await sharp(buffer, { animated: false, limitInputPixels: MAX_IMAGE_PIXELS }).rotate().webp({ quality: 82 }).toFile(originalPath);
    await sharp(buffer, { animated: false, limitInputPixels: MAX_IMAGE_PIXELS }).rotate().resize(480, 480, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(thumbnailPath);

    return {
      success: true,
      file: {
        filename,
        originalName: file.originalname,
        size: (await fs.promises.stat(originalPath)).size,
        mimetype: 'image/webp',
        relativePath: getRelativeImagePath(filename),
        thumbnailPath: getRelativeImagePath(filename, 'thumbnail'),
        absolutePath: originalPath,
        thumbnailAbsolutePath: thumbnailPath,
        uploadedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    await Promise.all([originalPath, thumbnailPath].filter(Boolean).map(filePath => fs.promises.rm(filePath, { force: true })));
    return { success: false, error: `Image processing failed: ${error.message}` };
  }
};

const cleanupFailedUpload = filePath => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error cleaning up failed upload:', error);
  }
};

const getImageInfo = relativePath => {
  if (!relativePath) return null;
  try {
    const filename = extractFilenameFromPath(relativePath);
    const absolutePath = getAbsoluteImagePath(filename);
    if (!fs.existsSync(absolutePath)) return null;
    const stats = fs.statSync(absolutePath);
    return { filename, relativePath, absolutePath, size: stats.size, createdAt: stats.birthtime, modifiedAt: stats.mtime };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

module.exports = { MAX_IMAGE_PIXELS, validateUploadedImage, validateImageMetadata, processUploadedImage, cleanupFailedUpload, getImageInfo };
