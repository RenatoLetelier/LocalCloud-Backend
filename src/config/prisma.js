// src/config/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ["warn", "error"] });

const softDeleteModels = new Set(["User"]);

if (typeof prisma.$use === "function") {
  prisma.$use(async (params, next) => {
    if (softDeleteModels.has(params.model)) {
      if (["findFirst", "findMany", "findUnique"].includes(params.action)) {
        const args = (params.args ||= {});
        const where = (args.where ||= {});
        if (where.deletedAt === undefined) {
          args.where = { ...where, deletedAt: null };
        }
      }
    }
    return next(params);
  });
} else {
  console.warn(
    "[Prisma] $use no está disponible (¿Edge/Data Proxy/Accelerate?). Se desactiva el middleware de soft delete."
  );
}

if (process.env.NODE_ENV !== "prod") globalForPrisma.prisma = prisma;
