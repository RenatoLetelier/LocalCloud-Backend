import { prisma } from "../../config/prisma.js";

export class UserMediaRepository {
  create(userId, mediaId, mediaType) {
    return prisma.userMedia.create({
      data: { userId, mediaId, mediaType },
    });
  }

  // Upsert — safe to call even if already assigned
  upsert(userId, mediaId, mediaType) {
    return prisma.userMedia.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: {},
      create: { userId, mediaId, mediaType },
    });
  }

  findByUser(userId) {
    return prisma.userMedia.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findByUserAndType(userId, mediaType) {
    return prisma.userMedia.findMany({
      where: { userId, mediaType },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id) {
    return prisma.userMedia.findUnique({ where: { id } });
  }

  findByUserAndMediaId(userId, mediaId) {
    return prisma.userMedia.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
    });
  }

  delete(id) {
    return prisma.userMedia.delete({ where: { id } });
  }

  deleteByUserAndMediaId(userId, mediaId) {
    return prisma.userMedia.delete({
      where: { userId_mediaId: { userId, mediaId } },
    });
  }

  deleteByMediaId(mediaId) {
    return prisma.userMedia.deleteMany({ where: { mediaId } });
  }
}
