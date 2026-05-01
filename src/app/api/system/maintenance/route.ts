import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to format date to DDMMYYYY (Buddhist Era) - UTC Based to match src/lib/prisma.ts
function getPasswordUTC(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const beYear = d.getUTCFullYear() + 543;
  return `${day}${month}${beYear}`;
}

async function syncModel(modelName: 'teacher' | 'student') {
  const users = await (prisma[modelName] as any).findMany({
    where: {
      password: { not: null },
      dateOfBirth: { not: null }
    }
  });

  let updated = 0;
  let alreadyCorrect = 0;
  let skipped = 0;

  for (const user of users) {
    const utcPlain = getPasswordUTC(user.dateOfBirth);
    if (!utcPlain) continue;

    // Check if current password matches UTC plain
    const isCorrect = await bcrypt.compare(utcPlain, user.password);
    if (isCorrect) {
      alreadyCorrect++;
      continue;
    }

    try {
      // Re-hash to UTC plain
      const newHash = await bcrypt.hash(utcPlain, 10);
      await (prisma[modelName] as any).update({
        where: { id: user.id },
        data: { password: newHash }
      });
      updated++;
    } catch (e) {
      skipped++;
    }
  }

  return { model: modelName, total: users.length, updated, alreadyCorrect, skipped };
}

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
    const teacherResult = await syncModel('teacher');
    const studentResult = await syncModel('student');
    const junctionResult = await fixUploadDirectories();

    return NextResponse.json({
      status: 'success',
      message: 'Maintenance completed',
      debug: junctionResult,
      results: [teacherResult, studentResult]
    });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
