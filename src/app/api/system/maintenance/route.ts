import { NextRequest, NextResponse } from 'next/server';

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

    // 2. Handle standalone uploads junction
    if (isStandalone && fs.existsSync(standalonePublic)) {
      // If standalone uploads exists as a real directory, we must move it to create a junction
      if (fs.existsSync(standaloneUploads)) {
        const stats = fs.lstatSync(standaloneUploads);
        if (!stats.isSymbolicLink()) {
          const backupName = `uploads_bak_${Date.now()}`;
          const backupPath = path.join(standalonePublic, backupName);
          fs.renameSync(standaloneUploads, backupPath);
          log.push(`Moved existing standalone uploads directory to ${backupName}`);
        }
      }

      // Create junction: standalone/public/uploads -> root/public/uploads
      if (!fs.existsSync(standaloneUploads)) {
        try {
          // On Windows Plesk, 'junction' is the most compatible way for directory links
          fs.symlinkSync(rootUploads, standaloneUploads, 'junction');
          log.push("✅ Successfully created Junction for uploads! (standalone -> root)");
        } catch (e: any) {
          log.push(`❌ Junction error: ${e.message}`);
        }
      } else {
        log.push("Uploads path already exists and is likely a link.");
      }
    } else {
      log.push(`Not in standalone or public dir missing. CWD: ${cwd}`);
    }
  } catch (e: any) {
    log.push(`Fatal Error: ${e.message}`);
  }

  return { isStandalone, cwd, rootDir, log };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

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
