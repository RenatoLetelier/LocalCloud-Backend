import { prisma } from "../../config/prisma.js";

const SINGLETON_ID = "singleton";

export class TunnelRepository {
  get() {
    return prisma.tunnelConfig.findUnique({ where: { id: SINGLETON_ID } });
  }

  set(url, uploadUrl) {
    const data = { url, ...(uploadUrl !== undefined && { uploadUrl }) };
    return prisma.tunnelConfig.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
  }
}
