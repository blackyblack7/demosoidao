import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import fs from "fs";

/**
 * Returns the absolute path to the project's TRUE public directory.
 * In standalone mode, process.cwd() is .next/standalone, so we need to go up 2 levels.
 */
function getPublicPath() {
  const cwd = process.cwd();
  // If we are inside the standalone directory, the real public is 2 levels up
  if (cwd.includes('standalone')) {
    return path.join(cwd, '..', '..', 'public');
  }
  // Otherwise, it's just the local public folder
  return path.join(cwd, 'public');
}

export async function uploadImage(
  image: File,
  options: {
    folder: string;
    filenamePrefix?: string;
    width?: number;
    height?: number;
  }
) {
  const { folder, filenamePrefix = "upload", width, height } = options;

  try {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with .webp extension
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const fileName = `${filenamePrefix}-${Date.now()}-${uniqueId}.webp`;
    
    // Determine the true public path
    const publicRoot = getPublicPath();
    const relativeDir = path.join("uploads", folder);
    const uploadDir = path.join(publicRoot, relativeDir);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // Process image with sharp: resize and convert to webp
    let pipeline = sharp(buffer);

    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: "cover",
        position: "center",
      });
    }

    const webpBuffer = await pipeline
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    // Write file to disk
    await writeFile(filePath, webpBuffer);

    // Return the URL path for database storage
    // Always returns /uploads/folder/filename.webp for the web
    return `/${relativeDir}/${fileName}`.replace(/\\/g, '/');
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteFile(relativeUrl: string | null | undefined) {
  if (!relativeUrl) return;

  try {
    const publicRoot = getPublicPath();
    // Remove leading slash if exists
    const normalizedUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    const filePath = path.join(publicRoot, normalizedUrl);

    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
}
