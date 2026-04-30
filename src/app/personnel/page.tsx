import { prisma } from "@/lib/prisma";
import PersonnelContent from "./_components/PersonnelContent";

export const metadata = {
  title: "บุคลากร | โรงเรียนสอยดาววิทยา",
  description: "ทำเนียบบุคลากรโรงเรียนสอยดาววิทยา แบ่งตามกลุ่มสาระการเรียนรู้และกลุ่มบริหารงาน",
};

export default async function PersonnelPage() {
  const [teachers, departments, adminGroups] = await Promise.all([
    prisma.teacher.findMany({
      include: {
        prefixRef: true,
        positionRef: true,
        academicStandingRef: true,
        department: true,
        divisions: {
          include: { group: true },
        },
        adminGroups: true,
      },
      orderBy: [
        { positionId: "asc" },
        { firstName: "asc" },
      ],
    }),
    prisma.academicDepartment.findMany({
      include: {
        head: {
          select: { id: true, firstName: true, lastName: true, prefixRef: true, positionRef: true, profileImage: true },
        },
      },
      orderBy: { departmentName: "asc" },
    }),
    prisma.adminGroup.findMany({
      include: {
        divisions: {
          include: {
            head: {
              select: { id: true, firstName: true, lastName: true, prefixRef: true, positionRef: true, profileImage: true },
            },
          },
        },
        head: {
          select: { id: true, firstName: true, lastName: true, prefixRef: true, positionRef: true, profileImage: true },
        },
      },
      orderBy: { groupName: "asc" },
    }),
  ]);

  // Serialize for client component (Dates, Decimals, etc.)
  const serialized = JSON.parse(JSON.stringify({
    teachers,
    departments,
    adminGroups,
  }));

  return <PersonnelContent {...serialized} />;
}
