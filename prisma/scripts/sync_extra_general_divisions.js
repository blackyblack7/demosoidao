const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeSync() {
    const groupName = 'กลุ่มบริหารงานทั่วไป';
    const group = await prisma.adminGroup.findUnique({ where: { groupName: groupName } });
    if (!group) {
        console.error(`Group not found: ${groupName}`);
        return;
    }

    const divisions = [
        'งานประสานงานและพัฒนาเครือข่ายการศึกษา',
        'งานประชาสัมพันธ์และประสานงานชุมชน',
        'งานบริการและส่งเสริมสุขภาพนักเรียน',
        'งานธนาคารโรงเรียน',
        'งานธุรการและสารบรรณกลาง'
    ];
    
    for (const name of divisions) {
        const existing = await prisma.adminDivision.findFirst({ where: { divisionName: name } });
        if (existing) {
            await prisma.adminDivision.update({
                where: { id: existing.id },
                data: { groupId: group.id }
            });
        } else {
            await prisma.adminDivision.create({
                data: { divisionName: name, groupId: group.id }
            });
        }
        console.log(`Synced: ${name}`);
    }
}

safeSync().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
