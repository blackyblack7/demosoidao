const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const groups = await prisma.adminGroup.findMany();
  console.log(JSON.stringify(groups, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
