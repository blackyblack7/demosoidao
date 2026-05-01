import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

interface UploadOptions {
  folder: string;
  filenamePrefix: string;
  maxWidth?: number;
  maxHeight?: number;
  fit?: keyof sharp.FitEnum;
}

/**
 * Standardized Image Upload Utility
 * Handles WebP conversion, resizing, and professional organization
 */
export async function uploadImage(file: File, options: UploadOptions) {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Default optimization settings
  const { 
    folder, 
    filenamePrefix, 
    maxWidth = 1200, 
    maxHeight, 
    fit = 'inside' 
  } = options;

  let pipeline = sharp(buffer);

  // Resize if needed
  if (maxWidth || maxHeight) {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit,
      withoutEnlargement: true // Never upscale
    });
  }

  // Convert to WebP with balanced quality
  const webpBuffer = await pipeline
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  const uniqueId = Math.random().toString(36).substring(2, 15);
  const fileName = `${filenamePrefix}-${Date.now()}-${uniqueId}.webp`;
  const relativeDir = path.join("uploads", folder).replace(/\\/g, '/');
  const uploadDir = path.join(process.cwd(), "public", relativeDir);

  // Ensure directory exists - use a more robust check for Linux/Windows
  try {
    const fsSync = require('fs');
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.error("Directory creation error:", err);
  }

  const fullPath = path.join(uploadDir, fileName);
  await fs.writeFile(fullPath, webpBuffer);

  // Return the path relative to the public folder
  return `/${relativeDir}/${fileName}`.replace(/\\/g, '/');
}

/**
 * Safely delete an image from the server
 */
export async function deleteFile(filePath: string | null | undefined) {
  if (!filePath) return;
  
  try {
    // Only allow deleting from the uploads folder for safety
    if (!filePath.startsWith('/uploads/')) return;

    const fullPath = path.join(process.cwd(), "public", filePath);
    
    // Check if exists before deleting
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    
    console.log(`Deleted file: ${fullPath}`);
  } catch (error) {
    // Silently fail if file doesn't exist or can't be deleted
    console.error(`Error deleting file ${filePath}:`, error);
  }
}
