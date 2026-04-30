'use server'

import { prisma } from "@/lib/prisma";

export async function getTeacherMetadataOptions() {
  const [prefixes, positions, standings, genders, bloodGroups] = await Promise.all([
    prisma.prefix.findMany({ orderBy: { name: 'asc' } }),
    prisma.teacherPosition.findMany({ orderBy: { level: 'desc' } }),
    prisma.academicStanding.findMany({ orderBy: { id: 'asc' } }),
    prisma.gender.findMany({ orderBy: { id: 'asc' } }),
    prisma.bloodGroup.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return {
    prefixes,
    positions,
    standings,
    genders,
    bloodGroups
  };
}

export async function getStudentMetadataOptions() {
  const [prefixes, statuses, genders, leaveTypes, disadvantagedTypes] = await Promise.all([
    prisma.prefix.findMany({ orderBy: { name: 'asc' } }),
    prisma.studentStatus.findMany({ orderBy: { id: 'asc' } }),
    prisma.gender.findMany({ orderBy: { id: 'asc' } }),
    prisma.studentLeaveType.findMany({ orderBy: { id: 'asc' } }),
    prisma.disadvantagedType.findMany({ orderBy: { id: 'asc' } }),
  ]);

  return {
    prefixes,
    statuses,
    genders,
    leaveTypes,
    disadvantagedTypes
  };
}

export async function getNewsMetadataOptions() {
  const categories = await prisma.newsCategory.findMany({ 
    where: {
      NOT: { name: 'ประกาศ' }
    },
    orderBy: { name: 'asc' } 
  });
  return { categories };
}

export async function getTeacherLeaveMetadataOptions() {
  const leaveTypes = await prisma.teacherLeaveType.findMany({ orderBy: { id: 'asc' } });
  return { leaveTypes };
}
