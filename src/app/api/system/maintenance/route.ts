import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Maintenance API - Simplified version
 * No more Symlinks/Junctions. 
 * Relies on server.js to serve files directly from the root public/uploads folder.
 */
async function runMaintenance() {
  const cwd = process.cwd();
  
  // Find the true project root public folder
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
    // 1. Just ensure directories exist in the true root
    const subdirs = ['news', 'popup', 'profiles'];
    if (!fs.existsSync(rootUploads)) {
      fs.mkdirSync(rootUploads, { recursive: true });
      log.push("Created root uploads directory");
    }

    subdirs.forEach(dir => {
      const p = path.join(rootUploads, dir);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        log.push(`Created directory: ${dir}`);
      }
      if (fs.existsSync(p)) {
        fileList[dir] = fs.readdirSync(p).slice(-5).reverse();
      }
    });
    
    log.push("✅ Directories are ready in the project root.");
  } catch (e: any) {
    log.push(`Error: ${e.message}`);
  }

  // 2. Database Check
  const dbStatus: any = {};
  try {
    dbStatus.popups = await prisma.sitePopup.findMany();
    dbStatus.latestNews = await prisma.blogPost.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 5,
      select: { id: true, title: true, thumbnail: true, published: true }
    });
  } catch (err: any) {
    dbStatus.error = err.message;
  }

  return { isStandalone, cwd, rootDir, log, fileList, dbStatus };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== 'full_sync') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await runMaintenance();
    
    // Force revalidate
    revalidatePath('/', 'layout');
    revalidatePath('/news', 'page');
    
    return NextResponse.json({
      status: 'success',
      message: 'Maintenance completed. System is now using direct file serving.',
      debug: result
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
