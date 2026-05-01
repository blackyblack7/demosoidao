import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Path is required', { status: 400 });
  }

  // Security: Prevent directory traversal
  if (filePath.includes('..')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  const cwd = process.cwd();
  
  // Try to find the file in the root public folder
  // On Plesk standalone, this is usually 2 levels up from .next/standalone
  let rootDir = cwd;
  if (cwd.includes('standalone')) {
    rootDir = path.join(cwd, '..', '..');
  }

  // Normalize path (ensure it doesn't start with / for path.join)
  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const fullPath = path.join(rootDir, 'public', normalizedPath);

  if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
    return new NextResponse('File not found', { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('Error reading file', { status: 500 });
  }
}
