'use server'

import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logger';
import { uploadImage, deleteFile } from '@/lib/upload';
import { GROUP_KEYS } from '@/constants';


export async function adminCreateTeacher(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const prefixId = formData.get("prefixId") ? parseInt(formData.get("prefixId") as string) : null;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const nationalId = formData.get("nationalId") as string;
  const positionId = formData.get("positionId") ? parseInt(formData.get("positionId") as string) : null;
  const academicStandingId = formData.get("academicStandingId") ? parseInt(formData.get("academicStandingId") as string) : null;
  const qualification = formData.get("qualification") as string;
  const major = formData.get("major") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const lineId = formData.get("lineId") as string;
  const nickName = formData.get("nickName") as string;
  const departmentId = parseInt(formData.get("departmentId") as string);
  const divisionIds = formData.getAll("divisionIds").map(id => parseInt(id as string));
  const adminGroupIds = formData.getAll("adminGroupIds").map(id => parseInt(id as string));
  const dateOfBirthStr = formData.get("dateOfBirth") as string;
  const profileImageFile = formData.get("profileImage") as File;

  
  // Physical fields
  const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
  const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;
  const bloodGroupId = formData.get("bloodGroupId") ? parseInt(formData.get("bloodGroupId") as string) : null;
  const otherInfo = formData.get("otherInfo") as string;

  // Address fields
  const houseNumber = formData.get("houseNumber") as string;
  const moo = formData.get("moo") as string;
  const subDistrict = formData.get("subDistrict") as string;
  const district = formData.get("district") as string;
  const province = formData.get("province") as string;
  const zipCode = formData.get("zipCode") as string;

  const currentHouseNumber = formData.get("currentHouseNumber") as string;
  const currentMoo = formData.get("currentMoo") as string;
  const currentSubDistrict = formData.get("currentSubDistrict") as string;
  const currentDistrict = formData.get("currentDistrict") as string;
  const currentProvince = formData.get("currentProvince") as string;
  const currentZipCode = formData.get("currentZipCode") as string;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let profileImagePath = null;
    if (profileImageFile && profileImageFile.size > 0) {
      profileImagePath = await uploadImage(profileImageFile, {
        folder: "personnel",
        filenamePrefix: `profile-${username}`,
        width: 400,
        height: 400,
        fit: 'cover'
      });
    }

    await prisma.teacher.create({
      data: {
        username,
        password: hashedPassword,
        prefixId,
        firstName,
        lastName,
        nickName: nickName || null,
        email: email || null,
        nationalId: nationalId || null,
        positionId,
        academicStandingId,
        qualification: qualification || null,
        major: major || null,
        phoneNumber: phoneNumber || null,
        lineId: lineId || null,
        isAdmin: false, 

        dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
        profileImage: profileImagePath,
        // Physical info
        weight: isNaN(weight as any) ? null : weight,
        height: isNaN(height as any) ? null : height,
        bloodGroupId,
        otherInfo: otherInfo || null,
        // Addresses
        houseNumber: houseNumber || null,
        moo: moo || null,
        subDistrict: subDistrict || null,
        district: district || null,
        province: province || null,
        zipCode: zipCode || null,
        currentHouseNumber: currentHouseNumber || null,
        currentMoo: currentMoo || null,
        currentSubDistrict: currentSubDistrict || null,
        currentDistrict: currentDistrict || null,
        currentProvince: currentProvince || null,
        currentZipCode: currentZipCode || null,
        departmentId: isNaN(departmentId) ? null : departmentId,
        divisions: {
          connect: divisionIds.map(id => ({ id }))
        },
        adminGroups: {
          connect: adminGroupIds.map(id => ({ id }))
        }
      }
    });

    await logActivity("CREATE_TEACHER", "งานบุคคล", `เพิ่มบุคลากร: ${firstName} ${lastName}`);
    revalidatePath('/management/personnel/teachers');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function adminUpdateTeacher(id: number, formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const prefixId = formData.get("prefixId") ? parseInt(formData.get("prefixId") as string) : null;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const nationalId = formData.get("nationalId") as string;
  const positionId = formData.get("positionId") ? parseInt(formData.get("positionId") as string) : null;
  const academicStandingId = formData.get("academicStandingId") ? parseInt(formData.get("academicStandingId") as string) : null;
  const qualification = formData.get("qualification") as string;
  const major = formData.get("major") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const lineId = formData.get("lineId") as string;
  const nickName = formData.get("nickName") as string;
  const dateOfBirthStr = formData.get("dateOfBirth") as string;
  const profileImageFile = formData.get("profileImage") as File;
  const departmentId = parseInt(formData.get("departmentId") as string);
  const divisionIds = formData.getAll("divisionIds").map(id => parseInt(id as string));
  const adminGroupIds = formData.getAll("adminGroupIds").map(id => parseInt(id as string));


  // Physical fields
  const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
  const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;
  const bloodGroupId = formData.get("bloodGroupId") ? parseInt(formData.get("bloodGroupId") as string) : null;
  const otherInfo = formData.get("otherInfo") as string;

  // Address fields
  const houseNumber = formData.get("houseNumber") as string;
  const moo = formData.get("moo") as string;
  const subDistrict = formData.get("subDistrict") as string;
  const district = formData.get("district") as string;
  const province = formData.get("province") as string;
  const zipCode = formData.get("zipCode") as string;

  const currentHouseNumber = formData.get("currentHouseNumber") as string;
  const currentMoo = formData.get("currentMoo") as string;
  const currentSubDistrict = formData.get("currentSubDistrict") as string;
  const currentDistrict = formData.get("currentDistrict") as string;
  const currentProvince = formData.get("currentProvince") as string;
  const currentZipCode = formData.get("currentZipCode") as string;
  
  // Fetch current data
  const currentTeacher = await prisma.teacher.findUnique({
    where: { id },
    include: { positionRef: true },
  });
  if (!currentTeacher) return { error: "ไม่พบบุคลากรในระบบ" };

  // Block editing SuperAdmin and executives (ผอ./รอง ผอ.)
  if (currentTeacher.isAdmin) return { error: "ไม่สามารถแก้ไขบัญชีผู้ดูแลระบบหลักได้" };
  if (currentTeacher.positionRef && currentTeacher.positionRef.level >= 8) return { error: "ไม่สามารถแก้ไขข้อมูลผู้บริหารได้" };

  // Username is read-only during update
  const username = currentTeacher.username;
  const password = formData.get("password") as string;

  try {
    let profileImagePath = currentTeacher.profileImage;
    if (profileImageFile && profileImageFile.size > 0) {
      // Delete old photo before uploading new one
      if (currentTeacher.profileImage) {
        await deleteFile(currentTeacher.profileImage);
      }
      
      profileImagePath = await uploadImage(profileImageFile, {
        folder: "personnel",
        filenamePrefix: `profile-${username || currentTeacher.username}`,
        width: 400,
        height: 400,
        fit: 'cover'
      });
    }

    const updateData: any = {
      prefixId,
      firstName: firstName || currentTeacher.firstName,
      lastName: lastName || currentTeacher.lastName,
      nickName: nickName || null,
      email: email || null,
      nationalId: nationalId || null,
      positionId,
      academicStandingId,
      qualification: qualification || null,
      major: major || null,
      phoneNumber: phoneNumber || null,
      lineId: lineId || null,
      username: currentTeacher.username, // Force original username
      dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
      profileImage: profileImagePath,
      // Physical info
      weight: isNaN(weight as any) ? null : weight,
      height: isNaN(height as any) ? null : height,
      bloodGroupId,
      otherInfo: otherInfo || null,
      // Addresses
      houseNumber: houseNumber || null,
      moo: moo || null,
      subDistrict: subDistrict || null,
      district: district || null,
      province: province || null,
      zipCode: zipCode || null,
      currentHouseNumber: currentHouseNumber || null,
      currentMoo: currentMoo || null,
      currentSubDistrict: currentSubDistrict || null,
      currentDistrict: currentDistrict || null,
      currentProvince: currentProvince || null,
      currentZipCode: currentZipCode || null,
      isAdmin: currentTeacher.isAdmin, 

      departmentId: isNaN(departmentId) ? null : departmentId,
      divisions: {
        set: divisionIds.map(id => ({ id }))
      },
      adminGroups: {
        set: adminGroupIds.map(id => ({ id }))
      }
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.teacher.update({
      where: { id },
      data: updateData
    });

    await logActivity("UPDATE_TEACHER", "งานบุคคล", `แก้ไขบุคลากร ID: ${id} (${firstName} ${lastName})`);
    revalidatePath('/management/personnel/teachers');
    revalidatePath(`/management/personnel/teachers/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function adminDeleteTeacher(id: number) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.PERSONNEL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { positionRef: true },
    });
    if (!teacher) return { error: "ไม่พบข้อมูลบุคลากร" };

    // Prevent deletion of SuperAdmin and executives (ผอ./รอง ผอ.)
    if (teacher.isAdmin) return { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้" };
    if (teacher.positionRef && teacher.positionRef.level >= 8) return { error: "ไม่สามารถลบข้อมูลผู้บริหารได้" };

    // Delete profile photo from disk
    if (teacher.profileImage) {
      await deleteFile(teacher.profileImage);
    }

    await prisma.teacher.delete({
      where: { id }
    });
    await logActivity("DELETE_TEACHER", "งานบุคคล", `ลบบุคลากร ID: ${id}`);
    revalidatePath('/management/personnel/teachers');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "ไม่สามารถลบข้อมูลได้" };
  }
}
