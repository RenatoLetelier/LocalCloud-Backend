import { prisma } from "../../config/prisma.js";

export class AlbumRepository {
  create(userId, name, description) {
    return prisma.album.create({
      data: { userId, name, description },
      include: { items: true },
    });
  }

  findByUser(userId) {
    return prisma.album.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
  }

  findById(id) {
    return prisma.album.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { userMedia: true },
        },
      },
    });
  }

  update(id, data) {
    return prisma.album.update({
      where: { id },
      data,
      include: { _count: { select: { items: true } } },
    });
  }

  delete(id) {
    return prisma.album.delete({ where: { id } });
  }

  addItem(albumId, userMediaId) {
    return prisma.albumItem.create({
      data: { albumId, userMediaId },
      include: { userMedia: true },
    });
  }

  removeItem(albumId, userMediaId) {
    return prisma.albumItem.delete({
      where: { albumId_userMediaId: { albumId, userMediaId } },
    });
  }

  findItem(albumId, userMediaId) {
    return prisma.albumItem.findUnique({
      where: { albumId_userMediaId: { albumId, userMediaId } },
    });
  }
}
