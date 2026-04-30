import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prismaClient = new PrismaClient()

// Helper to format date to DDMMYYYY (Buddhist Era)
function getPasswordFromDOB(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const beYear = d.getFullYear() + 543;
  return `${day}${month}${beYear}`;
}

export const prisma = prismaClient.$extends({
  query: {
    student: {
      async create({ args, query }) {
        if (args.data.dateOfBirth && (!args.data.password || args.data.password === "")) {
          const plain = getPasswordFromDOB(args.data.dateOfBirth as Date);
          if (plain) {
            args.data.password = await bcrypt.hash(plain, 10);
          }
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create.dateOfBirth && (!args.create.password || args.create.password === "")) {
          const plain = getPasswordFromDOB(args.create.dateOfBirth as Date);
          if (plain) {
            args.create.password = await bcrypt.hash(plain, 10);
          }
        }
        return query(args);
      }
    },
    teacher: {
      async create({ args, query }) {
        if (args.data.dateOfBirth && (!args.data.password || args.data.password === "")) {
          const plain = getPasswordFromDOB(args.data.dateOfBirth as Date);
          if (plain) {
            args.data.password = await bcrypt.hash(plain, 10);
          }
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create.dateOfBirth && (!args.create.password || args.create.password === "")) {
          const plain = getPasswordFromDOB(args.create.dateOfBirth as Date);
          if (plain) {
            args.create.password = await bcrypt.hash(plain, 10);
          }
        }
        return query(args);
      }
    }
  }
})

const globalForPrisma = globalThis as unknown as { prisma: typeof prisma }
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

