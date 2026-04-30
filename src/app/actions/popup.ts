"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function getSitePopup() {
  try {
    const popup = await prisma.sitePopup.findFirst();
    return popup;
  } catch (error) {
    console.error("Error fetching site popup:", error);
    return null;
  }
}

export async function updateSitePopup(formData: FormData) {
  try {
    const hasAccess = await checkAdminAccess("กลุ่มบริหารงานทั่วไป");
    if (!hasAccess) {
      return { error: "ไม่มีสิทธิ์ในการจัดการ Popup (ต้องอยู่กลุ่มบริหารงานทั่วไป)" };
    }

    const isActive = formData.get("isActive") === "true";
    const linkUrl = formData.get("linkUrl") as string || null;
    const imageFile = formData.get("image") as File | null;
    const keepExistingImage = formData.get("keepExistingImage") === "true";

    let popup = await prisma.sitePopup.findFirst();

    let newImageUrl = popup?.imageUrl || "";

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const filename = `popup-${uniqueSuffix}.webp`; // Assuming we want it as webp or save as original
      // In a real app we'd convert it using sharp, but let's just save it with original extension or webp if we don't have sharp here
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "popup");
      
      // Ensure dir exists (we can use fs.mkdir with recursive, but since it's simple, we'll try to just write. Wait, let's make sure it exists)
      const fs = require("fs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      
      newImageUrl = `/uploads/popup/${filename}`;
    } else if (!keepExistingImage) {
      return { error: "กรุณาอัปโหลดรูปภาพ Popup" };
    }

    if (popup) {
      await prisma.sitePopup.update({
        where: { id: popup.id },
        data: {
          isActive,
          imageUrl: newImageUrl,
          linkUrl
        }
      });
    } else {
      await prisma.sitePopup.create({
        data: {
          isActive,
          imageUrl: newImageUrl,
          linkUrl
        }
      });
    }

    revalidatePath("/");
    revalidatePath("/management/popup");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating site popup:", error);
    return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}
