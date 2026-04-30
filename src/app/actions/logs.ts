'use server'

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getPaginatedLogs(params: {
  page: number;
  limit: number;
  module?: string;
  query?: string;
}) {
  const session = await getSession();
  if (!session || (session.userId !== 1 && !session.isAdmin)) {
    throw new Error("Unauthorized");
  }

  const { page, limit, module, query } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (module) where.module = module;
  if (query) {
    where.OR = [
      { details: { contains: query } },
      { actor: { firstName: { contains: query } } },
      { actor: { lastName: { contains: query } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            prefixRef: { select: { name: true } },
            firstName: true,
            lastName: true,
            username: true
          }
        },
        academicYear: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
    hasMore: skip + items.length < total
  };
}

export async function getLogModules() {
  const modules = await prisma.auditLog.findMany({
    select: { module: true },
    distinct: ['module'],
  });
  return modules.map(m => m.module);
}
