import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function fixUploadDirectories() {
  const cwd = process.cwd();
  
  // Standard paths
  const standalonePublic = path.join(cwd, 'public');
  const standaloneUploads = path.join(standalonePublic, 'uploads');
  
  // Root paths
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
    if (!fs.existsSync(rootUploads)) {
      fs.mkdirSync(rootUploads, { recursive: true });
    }

    if (isStandalone && fs.existsSync(standalonePublic)) {
      if (fs.existsSync(standaloneUploads)) {
        const stats = fs.lstatSync(standaloneUploads);
        if (!stats.isSymbolicLink()) {
          const backupName = `uploads_bak_${Date.now()}`;
          fs.renameSync(standaloneUploads, path.join(standalonePublic, backupName));
        }
      }

      if (!fs.existsSync(standaloneUploads)) {
        fs.symlinkSync(rootUploads, standaloneUploads, 'junction');
        log.push("✅ Junction Created");
      }

      const subdirs = ['news', 'popup', 'profiles'];
      subdirs.forEach(dir => {
        const p = path.join(rootUploads, dir);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        if (fs.existsSync(p)) fileList[dir] = fs.readdirSync(p).slice(-5).reverse();
      });
    }
  } catch (e: any) { log.push(`FS Error: ${e.message}`); }

  // Database Check
  const dbStatus: any = {};
  try {
    dbStatus.popups = await prisma.sitePopup.findMany();
    dbStatus.latestNews = await prisma.blogPost.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 5,
      select: { id: true, title: true, thumbnail: true, published: true }
    });
  } catch (err: any) { dbStatus.error = err.message; }

  return { isStandalone, cwd, rootDir, log, fileList, dbStatus };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== 'full_sync') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await fixUploadDirectories();
    
    // Force revalidate
    revalidatePath('/', 'layout');
    revalidatePath('/news', 'page');
    
    return NextResponse.json({
      status: 'success',
      message: 'Maintenance completed and Cache cleared',
      debug: result
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
