import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId");
    const grade = searchParams.get("grade");
    const room = searchParams.get("room");
    const status = searchParams.get("status") || "กำลังศึกษา";
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    // Default to active term if not provided
    let targetTermId = termId ? parseInt(termId) : undefined;
    if (!targetTermId) {
      const activeTerm = await prisma.academicYear.findFirst({ where: { isActive: true } });
      if (activeTerm) targetTermId = activeTerm.id;
    }

    if (!targetTermId) {
      return NextResponse.json({ error: "No active term found and no termId provided" }, { status: 400 });
    }

    // Build query
    const whereClause: any = {
      termData: {
        some: {
          termId: targetTermId,
          ...(grade && { gradeLevel: grade }),
          ...(room && { roomNumber: parseInt(room) }),
          ...(status && { status: status }),
        }
      }
    };

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        termData: {
          where: { termId: targetTermId }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { studentCode: 'asc' }
    });

    const total = await prisma.student.count({ where: whereClause });

    return NextResponse.json({
      success: true,
      data: students,
      meta: {
        total,
        page,
        limit,
        termId: targetTermId
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
