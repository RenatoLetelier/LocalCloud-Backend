import { prisma } from "../../config/prisma.js";

const SINGLETON_ID = "singleton";

export class TunnelRepository {
  get() {
    return prisma.tunnelConfig.findUnique({ where: { id: SINGLETON_ID } });
  }

  set(url) {
    return prisma.tunnelConfig.upsert({
      where: { id: SINGLETON_ID },
      update: { url },
      create: { id: SINGLETON_ID, url },
    });
  }
}
