import { prisma } from "../../config/prisma.js";

export class PhotoRepository {
  create(data) {
    return prisma.photo.create({ data });
  }

  findById(id) {
    return prisma.photo.findUnique({
      where: { id },
    });
  }

  findByPath(path) {
    return prisma.photo.findUnique({ where: { path } });
  }

  findMany() {
    return prisma.photo.findMany();
  }

  update(id, data) {
    return prisma.photo.update({ where: { id }, data });
  }

  // soft delete
  delete(id) {
    return prisma.photo.delete({
      where: { id },
    });
  }
}
