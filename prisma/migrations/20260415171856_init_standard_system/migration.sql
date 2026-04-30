-- CreateTable
CREATE TABLE `Teacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nationalId` VARCHAR(13) NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NULL,
    `profileImage` TEXT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `prefix` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `nickName` VARCHAR(50) NULL,
    `email` VARCHAR(100) NOT NULL,
    `position` VARCHAR(100) NULL,
    `academicStanding` VARCHAR(100) NULL,
    `qualification` VARCHAR(150) NULL,
    `major` VARCHAR(150) NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `lineId` VARCHAR(100) NULL,
    `houseNumber` VARCHAR(50) NULL,
    `moo` VARCHAR(10) NULL,
    `subDistrict` VARCHAR(100) NULL,
    `district` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `zipCode` VARCHAR(10) NULL,
    `currentHouseNumber` VARCHAR(50) NULL,
    `currentMoo` VARCHAR(10) NULL,
    `currentSubDistrict` VARCHAR(100) NULL,
    `currentDistrict` VARCHAR(100) NULL,
    `currentProvince` VARCHAR(100) NULL,
    `currentZipCode` VARCHAR(10) NULL,
    `departmentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `personnelCategory` VARCHAR(50) NOT NULL DEFAULT 'ครู',

    UNIQUE INDEX `Teacher_nationalId_key`(`nationalId`),
    UNIQUE INDEX `Teacher_username_key`(`username`),
    UNIQUE INDEX `Teacher_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AcademicDepartment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentName` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminDivision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `divisionName` VARCHAR(100) NOT NULL,
    `groupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupName` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `AdminGroup_groupName_key`(`groupName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `excerpt` TEXT NULL,
    `coverImage` TEXT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `authorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `category` VARCHAR(50) NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AcademicYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `semester` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nationalId` VARCHAR(13) NOT NULL,
    `studentCode` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NULL,
    `profileImage` TEXT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `prefix` VARCHAR(50) NOT NULL,
    `firstNameTh` VARCHAR(100) NOT NULL,
    `lastNameTh` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(10) NULL,
    `disadvantagedType` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_nationalId_key`(`nationalId`),
    UNIQUE INDEX `Student_studentCode_key`(`studentCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentTermData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gradeLevel` VARCHAR(50) NOT NULL,
    `roomNumber` INTEGER NOT NULL,
    `studentNumber` INTEGER NULL,
    `weight` DECIMAL(5, 2) NULL,
    `height` DECIMAL(5, 2) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'กำลังศึกษา',
    `studentId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentParent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `relationship` VARCHAR(50) NOT NULL,
    `nationalId` VARCHAR(13) NULL,
    `prefix` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `addressType` VARCHAR(50) NOT NULL,
    `houseNumber` VARCHAR(50) NOT NULL,
    `moo` VARCHAR(10) NULL,
    `subDistrict` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `zipCode` VARCHAR(10) NOT NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectCode` VARCHAR(20) NOT NULL,
    `subjectName` VARCHAR(150) NOT NULL,
    `credits` DECIMAL(3, 1) NOT NULL,
    `teacherId` INTEGER NULL,

    UNIQUE INDEX `Subject_subjectCode_key`(`subjectCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeroomAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `gradeLevel` VARCHAR(50) NOT NULL,
    `roomNumber` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `reason` TEXT NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'รอการอนุมัติ',
    `termId` INTEGER NOT NULL,
    `headApprovedById` INTEGER NULL,
    `deputyApprovedById` INTEGER NULL,
    `directorApprovedById` INTEGER NULL,
    `securityById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherExtraDuty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherId` INTEGER NOT NULL,
    `roleTitle` VARCHAR(150) NOT NULL,
    `academicYear` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherLeave` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherId` INTEGER NOT NULL,
    `leaveType` VARCHAR(100) NOT NULL,
    `reason` TEXT NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalDays` INTEGER NOT NULL,
    `staffVerifiedById` INTEGER NULL,
    `headApprovedById` INTEGER NULL,
    `deputyApprovedById` INTEGER NULL,
    `directorApprovedById` INTEGER NULL,
    `deniedById` INTEGER NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(100) NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `actorId` INTEGER NULL,
    `academicYearId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TeacherDivisions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TeacherDivisions_AB_unique`(`A`, `B`),
    INDEX `_TeacherDivisions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `AcademicDepartment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminDivision` ADD CONSTRAINT `AdminDivision_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `AdminGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentTermData` ADD CONSTRAINT `StudentTermData_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentTermData` ADD CONSTRAINT `StudentTermData_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentParent` ADD CONSTRAINT `StudentParent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAddress` ADD CONSTRAINT `StudentAddress_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HomeroomAssignment` ADD CONSTRAINT `HomeroomAssignment_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HomeroomAssignment` ADD CONSTRAINT `HomeroomAssignment_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_headApprovedById_fkey` FOREIGN KEY (`headApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_deputyApprovedById_fkey` FOREIGN KEY (`deputyApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_directorApprovedById_fkey` FOREIGN KEY (`directorApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_securityById_fkey` FOREIGN KEY (`securityById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherExtraDuty` ADD CONSTRAINT `TeacherExtraDuty_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_staffVerifiedById_fkey` FOREIGN KEY (`staffVerifiedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_headApprovedById_fkey` FOREIGN KEY (`headApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_deputyApprovedById_fkey` FOREIGN KEY (`deputyApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_directorApprovedById_fkey` FOREIGN KEY (`directorApprovedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherLeave` ADD CONSTRAINT `TeacherLeave_deniedById_fkey` FOREIGN KEY (`deniedById`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TeacherDivisions` ADD CONSTRAINT `_TeacherDivisions_A_fkey` FOREIGN KEY (`A`) REFERENCES `AdminDivision`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TeacherDivisions` ADD CONSTRAINT `_TeacherDivisions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
