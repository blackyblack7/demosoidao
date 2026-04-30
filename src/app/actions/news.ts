'use server'

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession, checkAdminAccess } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { revalidatePath, updateTag, unstable_cache } from "next/cache";
import { uploadImage, deleteFile } from "@/lib/upload";
import { handleActionError } from "@/lib/errors";
import fs from "node:fs/promises";
import path from "node:path";
import { GROUP_KEYS } from "@/constants";

/** Cache tag used for all news content — revalidated on every write operation. */
const NEWS_CACHE_TAG = 'news';

function generateUniqueSlug() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


export async function adminCreateNews(formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.GENERAL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const session = await getSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : null;
  const published = formData.get("published") === "true";
  const driveLink = formData.get("driveLink") as string;
  
  const thumbnailFile = formData.get("thumbnail") as File;
  const galleryFiles = formData.getAll("galleryImages") as File[];

  if (!title || !content) {
    return { error: "กรุณากรอกหัวข้อและเนื้อหา" };
  }

  try {
    // Generate unique slug first so we can use it for folder name
    const slug = generateUniqueSlug();

    let thumbnailPath = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailPath = await uploadImage(thumbnailFile, {
        folder: `news/${slug}`,
        filenamePrefix: 'thumb',
        maxWidth: 1200
      });
    }

    const galleryPaths: string[] = [];
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const p = await uploadImage(file, {
          folder: `news/${slug}`,
          filenamePrefix: 'gallery',
          maxWidth: 1200
        });
        if (p) galleryPaths.push(p);
      }
    }

    const news = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: content.substring(0, 150).replace(/<[^>]*>/g, '') + "...",
        categoryId,
        published,
        thumbnail: thumbnailPath,
        gallery: galleryPaths,
        driveLink: driveLink || null,
        authorId: session.userId,
      }
    });

    await logActivity("CREATE_NEWS", "ประชาสัมพันธ์", `สร้างข่าว: ${title}`);
    revalidatePath("/news");
    revalidatePath("/");
    updateTag(NEWS_CACHE_TAG);

    return { success: true, newsId: news.id };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adminUpdateNews(id: number, formData: FormData) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.GENERAL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const session = await getSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : null;
  const published = formData.get("published") === "true";
  const driveLink = formData.get("driveLink") as string;
  
  const thumbnailFile = formData.get("thumbnail") as File;
  const galleryFiles = formData.getAll("galleryImages") as File[];

  try {
    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return { error: "ไม่พบข่าวที่ต้องการแก้ไข" };

    const slug = current.slug; // Use existing slug for folder consistency

    let thumbnailPath = current.thumbnail;
    if (thumbnailFile && thumbnailFile.size > 0) {
      // Clean up old thumbnail
      await deleteFile(current.thumbnail);
      thumbnailPath = await uploadImage(thumbnailFile, {
        folder: `news/${slug}`,
        filenamePrefix: 'thumb',
        maxWidth: 1200
      });
    }

    let galleryPaths = (current.gallery as string[]) || [];
    if (galleryFiles.length > 0 && galleryFiles[0].size > 0) {
       // Clean up old gallery files
       for (const oldPath of galleryPaths) {
         await deleteFile(oldPath);
       }
       
       const newPaths = [];
       for (const file of galleryFiles) {
         if (file && file.size > 0) {
           const p = await uploadImage(file, {
             folder: `news/${slug}`,
             filenamePrefix: 'gallery',
             maxWidth: 1200
           });
           if (p) newPaths.push(p);
         }
       }
       galleryPaths = newPaths; 
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        excerpt: content.substring(0, 150).replace(/<[^>]*>/g, '') + "...",
        categoryId,
        published,
        thumbnail: thumbnailPath,
        gallery: galleryPaths,
        driveLink: driveLink || null,
      }
    });

    await logActivity("UPDATE_NEWS", "ประชาสัมพันธ์", `แก้ไขข่าว: ${title}`);
    revalidatePath("/news");
    revalidatePath(`/news/${current.slug}`);
    revalidatePath("/");
    updateTag(NEWS_CACHE_TAG);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adminDeleteNews(id: number) {
  const hasAccess = await checkAdminAccess(GROUP_KEYS.GENERAL);
  if (!hasAccess) return { error: "ไม่มีสิทธิ์ดำเนินการ" };

  const session = await getSession();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" };

  try {
    const news = await prisma.blogPost.findUnique({ where: { id } });
    if (!news) return { error: "ไม่พบข่าว" };

    // Clean up folder on disk
    if (news.slug) {
      const newsDir = path.join(process.cwd(), "public", "uploads", "news", news.slug);
      try {
        await fs.rm(newsDir, { recursive: true, force: true });
        console.log(`Deleted news directory: ${newsDir}`);
      } catch (err) {
        console.error("Error deleting news directory:", err);
      }
    }

    await prisma.blogPost.delete({ where: { id } });
    await logActivity("DELETE_NEWS", "ประชาสัมพันธ์", `ลบข่าว: ${news.title}`);
    revalidatePath("/news");
    revalidatePath("/");
    updateTag(NEWS_CACHE_TAG);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Cached: fetches latest published news.
 * Cache is invalidated on every create/update/delete via revalidateTag(NEWS_CACHE_TAG).
 */
export const getLatestNews = unstable_cache(
  async (limit = 6) => {
    return prisma.blogPost.findMany({
      where: { 
        published: true,
        NOT: {
          categoryRef: { name: 'ประกาศ' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: { firstName: true, lastName: true, prefixRef: { select: { name: true } } },
        },
        categoryRef: true,
      },
    });
  },
  ['latest-news'],
  { tags: [NEWS_CACHE_TAG], revalidate: 300 } // Stale after 5 min, but always fresh after mutations
);

interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

/**
 * Paginated news with optional category/search filter.
 * Not cached (user-driven filter params change frequently).
 */
export async function getNewsPaginated({
  page = 1,
  limit = 12,
  category = 'ทั้งหมด',
  search = '',
}: PaginationParams) {
  const skip = (page - 1) * limit;

  const where: Prisma.BlogPostWhereInput = {
    published: true,
    NOT: {
      categoryRef: { name: 'ประกาศ' }
    },
    ...(category !== 'ทั้งหมด' && (isNaN(parseInt(category)) ? { category } : { categoryId: parseInt(category) })),
    ...(search && {
      OR: (() => {
        const or: Prisma.BlogPostWhereInput[] = [
          { title: { contains: search } },
          { content: { contains: search } },
          { categoryRef: { name: { contains: search } } },
        ];

        // Handle year search (e.g., 2025 or 2568)
        const yearMatch = search.trim().match(/^(\d{4})$/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          const adYear = year > 2400 ? year - 543 : year;
          or.push({
            createdAt: {
              gte: new Date(`${adYear}-01-01T00:00:00.000Z`),
              lte: new Date(`${adYear}-12-31T23:59:59.999Z`),
            }
          });
        }
        
        return or;
      })(),
    }),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { firstName: true, lastName: true, prefixRef: { select: { name: true } }, profileImage: true },
          },
          categoryRef: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      hasMore: skip + items.length < total,
      total,
    };
  } catch (error) {
    console.error('Pagination Error:', error);
    return { items: [], hasMore: false, total: 0 };
  }
}

/**
 * Fetches latest announcements (BlogPost with category 'ประกาศ').
 */
export const getLatestAnnouncements = unstable_cache(
  async (limit = 5) => {
    return prisma.blogPost.findMany({
      where: { 
        published: true,
        categoryRef: { name: 'ประกาศ' }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        driveLink: true,
        slug: true,
        createdAt: true
      }
    });
  },
  ['latest-announcements'],
  { tags: [NEWS_CACHE_TAG], revalidate: 300 }
);

/**
 * Paginated announcements (BlogPost with category 'ประกาศ') with optional search filter.
 */
export async function getAnnouncementsPaginated({
  page = 1,
  limit = 20,
  search = '',
}: { page?: number; limit?: number; search?: string }) {
  const skip = (page - 1) * limit;

  const where: Prisma.BlogPostWhereInput = {
    published: true,
    categoryRef: { name: 'ประกาศ' },
    ...(search && {
      OR: [
        { title: { contains: search } },
        { content: { contains: search } },
      ],
    }),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { firstName: true, lastName: true, prefixRef: { select: { name: true } }, profileImage: true },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      hasMore: skip + items.length < total,
      total,
    };
  } catch (error) {
    console.error('Announcement Pagination Error:', error);
    return { items: [], hasMore: false, total: 0 };
  }
}
