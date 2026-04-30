const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      createdAt: true,
      thumbnail: true,
      gallery: true
    }
  });

  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
