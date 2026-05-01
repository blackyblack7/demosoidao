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
  let fileList: Record<string, string[]> = {};

  try {
    // 1. Ensure root uploads exists
    if (!fs.existsSync(rootUploads)) {
      fs.mkdirSync(rootUploads, { recursive: true });
      log.push(`Created root uploads dir: ${rootUploads}`);
    }

    // 2. Handle standalone uploads junction
    if (isStandalone && fs.existsSync(standalonePublic)) {
      if (fs.existsSync(standaloneUploads)) {
        const stats = fs.lstatSync(standaloneUploads);
        if (!stats.isSymbolicLink()) {
          const backupName = `uploads_bak_${Date.now()}`;
          const backupPath = path.join(standalonePublic, backupName);
          fs.renameSync(standaloneUploads, backupPath);
          log.push(`Moved existing standalone uploads directory to ${backupName}`);
        }
      }

      if (!fs.existsSync(standaloneUploads)) {
        try {
          fs.symlinkSync(rootUploads, standaloneUploads, 'junction');
          log.push("✅ Successfully created Junction for uploads! (standalone -> root)");
        } catch (e: any) {
          log.push(`❌ Junction error: ${e.message}`);
        }
      } else {
        log.push("Uploads path already exists and is likely a link.");
      }

      // Always ensure common subdirectories exist in root
      const subdirs = ['news', 'popup', 'profiles'];
      subdirs.forEach(dir => {
        const p = path.join(rootUploads, dir);
        if (!fs.existsSync(p)) {
          try {
            fs.mkdirSync(p, { recursive: true });
            log.push(`Pre-created subdir: ${dir}`);
          } catch (err: any) {
            log.push(`❌ Failed to create subdir ${dir}: ${err.message}`);
          }
        }
        
        // List files for debugging
        if (fs.existsSync(p)) {
          fileList[dir] = fs.readdirSync(p).slice(0, 10); // show first 10 files
        }
      });
    } else {
      log.push(`Not in standalone or public dir missing. CWD: ${cwd}`);
    }
  } catch (e: any) {
    log.push(`Fatal Error: ${e.message}`);
  }

  return { isStandalone, cwd, rootDir, log, fileList };
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
