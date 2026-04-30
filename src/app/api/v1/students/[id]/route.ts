import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if id is a number (database ID) or studentCode
    const isNumeric = !isNaN(parseInt(id));

    const student = await prisma.student.findFirst({
      where: isNumeric 
        ? { OR: [{ id: parseInt(id) }, { studentCode: id }] }
        : { studentCode: id },
      include: {
        termData: {
          include: {
            term: true
          },
          orderBy: [
            { term: { year: 'desc' } },
            { term: { semester: 'desc' } }
          ]
        },
        parents: true,
        addresses: true
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: student
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
