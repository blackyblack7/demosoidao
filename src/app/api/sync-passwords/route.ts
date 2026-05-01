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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Security check: /api/sync-passwords?key=soidao_sync
  if (key !== 'soidao_sync') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const teacherResult = await syncModel('teacher');
    const studentResult = await syncModel('student');

    // Debugging path information for Plesk
    let rootDir = process.cwd();
    const isStandalone = rootDir.includes('standalone');
    if (isStandalone) {
      rootDir = require('path').join(rootDir, '..', '..');
    }
    const publicPath = require('path').join(rootDir, 'public');
    const publicExists = require('fs').existsSync(publicPath);

    return NextResponse.json({
      status: 'success',
      message: 'Password synchronization completed',
      debug: {
        cwd: process.cwd(),
        rootDir,
        isStandalone,
        publicPath,
        publicExists
      },
      results: [teacherResult, studentResult]
    });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
