import { prisma } from './prisma';

export async function getActiveAcademicYear() {
  return await prisma.academicYear.findFirst({
    where: { isActive: true }
  });
}

export async function getAllAcademicYears() {
  return await prisma.academicYear.findMany({
    orderBy: [
      { year: 'desc' },
      { semester: 'desc' }
    ]
  });
}
