import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

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

      // Ensure common subdirectories
      const subdirs = ['news', 'popup', 'profiles'];
      subdirs.forEach(dir => {
        const p = path.join(rootUploads, dir);
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p, { recursive: true });
        }
        if (fs.existsSync(p)) {
          fileList[dir] = fs.readdirSync(p).slice(-5).reverse(); // show latest 5 files
        }
      });
    }
  } catch (e: any) {
    log.push(`Fatal Error: ${e.message}`);
  }

  // 3. Database Check
  const dbStatus: any = {};
  try {
    const popup = await prisma.sitePopup.findFirst();
    dbStatus.popup = {
      id: popup?.id,
      imageUrl: popup?.imageUrl,
      isActive: popup?.isActive,
      fileExists: popup?.imageUrl ? fs.existsSync(path.join(rootDir, 'public', popup.imageUrl)) : false
    };

    const latestNews = await prisma.blogPost.findFirst({ orderBy: { createdAt: 'desc' } });
    dbStatus.latestNews = {
      title: latestNews?.title,
      thumbnail: latestNews?.thumbnail,
      fileExists: latestNews?.thumbnail ? fs.existsSync(path.join(rootDir, 'public', latestNews.thumbnail)) : false
    };
  } catch (err: any) {
    dbStatus.error = err.message;
  }

  return { isStandalone, cwd, rootDir, log, fileList, dbStatus };
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
