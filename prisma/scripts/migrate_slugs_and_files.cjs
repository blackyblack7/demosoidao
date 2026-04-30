const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');
const prisma = new PrismaClient();

function generateNumericSlug(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function migrate() {
  const posts = await prisma.blogPost.findMany();
  console.log(`Found ${posts.length} posts to migrate.`);

  for (const post of posts) {
    const newSlug = generateNumericSlug(new Date(post.createdAt));
    const oldSlug = post.slug;
    
    if (newSlug === oldSlug) {
      console.log(`Post ID ${post.id}: Already has correct slug ${newSlug}. Skipping.`);
      continue;
    }

    console.log(`Migrating Post ID ${post.id}: ${oldSlug} -> ${newSlug}`);

    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads', 'news');
    const oldFolderPath = path.join(baseUploadDir, oldSlug);
    const newFolderPath = path.join(baseUploadDir, newSlug);

    // 1. Handle Folders
    try {
      const oldFolderExists = await fs.access(oldFolderPath).then(() => true).catch(() => false);
      if (oldFolderExists) {
        console.log(`  Moving folder: ${oldSlug} -> ${newSlug}`);
        await fs.rename(oldFolderPath, newFolderPath);
      } else {
        // If folder doesn't exist, maybe files are in the root?
        // Let's create the new folder anyway to be ready.
        await fs.mkdir(newFolderPath, { recursive: true });
        console.log(`  Created new folder: ${newSlug}`);
      }
    } catch (e) {
      console.error(`  Error handling folders for ${post.id}:`, e.message);
    }

    // 2. Move files from root if they were there
    const migrateFilePath = async (oldPath) => {
      if (!oldPath) return null;
      
      // If path already contains a subfolder that is NOT the old slug, it's tricky.
      // But based on my research, they are currently in /uploads/news/filename.webp
      const fileName = path.basename(oldPath);
      const isRecordInRoot = oldPath.startsWith('/uploads/news/') && !oldPath.startsWith(`/uploads/news/${oldSlug}/`);
      
      if (isRecordInRoot) {
        const sourcePath = path.join(process.cwd(), 'public', 'uploads', 'news', fileName);
        const destinationPath = path.join(newFolderPath, fileName);
        
        try {
          const fileExists = await fs.access(sourcePath).then(() => true).catch(() => false);
          if (fileExists) {
             await fs.rename(sourcePath, destinationPath);
             console.log(`    Moved file: ${fileName} to subfolder`);
          }
        } catch (e) {
          console.error(`    Error moving file ${fileName}:`, e.message);
        }
      }
      
      // Return new DB path
      return `/uploads/news/${newSlug}/${fileName}`.replace(/\\/g, '/');
    };

    const newThumbnail = await migrateFilePath(post.thumbnail);
    
    let newGallery = [];
    if (Array.isArray(post.gallery)) {
      for (const gPath of post.gallery) {
        const migrated = await migrateFilePath(gPath);
        if (migrated) newGallery.push(migrated);
      }
    }

    // 3. Update Database
    try {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          slug: newSlug,
          thumbnail: newThumbnail,
          gallery: newGallery
        }
      });
      console.log(`  Successfully updated DB for ${post.id}`);
    } catch (e) {
      console.error(`  Error updating DB for ${post.id}:`, e.message);
    }
  }

  console.log('Migration complete.');
}

migrate()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
