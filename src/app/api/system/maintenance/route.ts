import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function fixUploadDirectories() {
  const fs = require('fs');
  const path = require('path');
  const cwd = process.cwd();
  
  // Standard paths
  const standalonePublic = path.join(cwd, 'public');
  const standaloneUploads = path.join(standalonePublic, 'uploads');
  
  // Root paths (2 levels up if in standalone)
  let rootDir = cwd;
  const isStandalone = cwd.includes('standalone');
  if (isStandalone) {
    rootDir = path.join(cwd, '..', '..');
  }
  const rootPublic = path.join(rootDir, 'public');
  const rootUploads = path.join(rootPublic, 'uploads');

  let log = [];

  try {
    // 1. Ensure root uploads exists
    if (!fs.existsSync(rootUploads)) {
      fs.mkdirSync(rootUploads, { recursive: true });
      log.push(`Created root uploads dir: ${rootUploads}`);
    }

    // 2. Handle standalone uploads
    if (isStandalone && fs.existsSync(standalonePublic)) {
      if (!fs.existsSync(standaloneUploads)) {
        // Create junction: standalone/public/uploads -> root/public/uploads
        try {
          fs.symlinkSync(rootUploads, standaloneUploads, 'junction');
          log.push("Successfully created Junction for uploads");
        } catch (e: any) {
          log.push(`Junction error: ${e.message}`);
        }
      } else {
        log.push("Uploads directory already exists in standalone");
      }
    }
  } catch (e: any) {
    log.push(`Fatal Error: ${e.message}`);
  }

  return { isStandalone, rootDir, log };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Security check: /api/system/maintenance?key=full_sync
  if (key !== 'full_sync') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const junctionResult = await fixUploadDirectories();

    return NextResponse.json({
      status: 'success',
      message: 'System maintenance completed',
      debug: junctionResult
    });
  } catch (error: any) {
    console.error('Maintenance Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
