'use server'

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" };

  const { userId, role } = session;

  try {
    if (role === "STUDENT") {
      const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
      const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;
      const houseNumber = formData.get("houseNumber") as string;
      const moo = formData.get("moo") as string;
      const subDistrict = formData.get("subDistrict") as string;
      const district = formData.get("district") as string;
      const province = formData.get("province") as string;
      const zipCode = formData.get("zipCode") as string;

      // Update latest term data (weight/height)
      const latestTerm = await prisma.studentTermData.findFirst({
        where: { studentId: userId },
        orderBy: { id: "desc" }
      });

      if (latestTerm) {
        await prisma.studentTermData.update({
          where: { id: latestTerm.id },
          data: { weight, height }
        });
      }

      // Update Address (ที่อยู่ปัจจุบัน)
      const currentAddress = await prisma.studentAddress.findFirst({
        where: { studentId: userId, addressTypeRef: { name: "ที่อยู่ปัจจุบัน" } }
      });

      if (currentAddress) {
        await prisma.studentAddress.update({
          where: { id: currentAddress.id },
          data: { houseNumber, moo, subDistrict, district, province, zipCode }
        });
      } else {
        const addrType = await prisma.addressType.findUnique({ where: { name: "ที่อยู่ปัจจุบัน" } });
        await prisma.studentAddress.create({
          data: {
            studentId: userId,
            addressTypeId: addrType?.id,
            houseNumber, moo, subDistrict, district, province, zipCode
          }
        });
      }
    } else if (role === "TEACHER") {
      const email = formData.get("email") as string;
      const phoneNumber = formData.get("phoneNumber") as string;
      const lineId = formData.get("lineId") as string;
      const major = formData.get("major") as string;
      const qualification = formData.get("qualification") as string;
      const houseNumber = formData.get("houseNumber") as string;
      const moo = formData.get("moo") as string;
      const subDistrict = formData.get("subDistrict") as string;
      const district = formData.get("district") as string;
      const province = formData.get("province") as string;
      const zipCode = formData.get("zipCode") as string;

      await prisma.teacher.update({
        where: { id: userId },
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          lineId: lineId || null,
          major: major || null,
          qualification: qualification || null,
          houseNumber: houseNumber || null,
          moo: moo || null,
          subDistrict: subDistrict || null,
          district: district || null,
          province: province || null,
          zipCode: zipCode || null
        }
      });
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function uploadProfileImage(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" };

  const { userId, role } = session;
  const image = formData.get("image") as File;

  if (!image || image.size === 0) return { error: "ไม่พบไฟล์รูปภาพ" };

  try {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(image.name) || ".jpg";
    const fileName = `${role.toLowerCase()}-${userId}-${Date.now()}${ext}`;
    const relativeDir = path.join("uploads", "profiles");
    const uploadDir = path.join(process.cwd(), "public", relativeDir);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const dbPath = `/${relativeDir}/${fileName}`.replace(/\\/g, '/');

    if (role === "TEACHER") {
      await prisma.teacher.update({
        where: { id: userId },
        data: { profileImage: dbPath }
      });
    } else {
      await prisma.student.update({
        where: { id: userId },
        data: { profileImage: dbPath }
      });
    }

    revalidatePath("/profile");
    return { success: true, imagePath: dbPath };
  } catch (error: any) {
    console.error("Upload Image Error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" };
  }
}
