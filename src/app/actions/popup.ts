"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/upload";

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
      const dbPath = await uploadImage(imageFile, {
        folder: "popup",
        filenamePrefix: "popup",
        maxWidth: 1200
      });
      
      if (dbPath) {
        newImageUrl = dbPath;
      }
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
