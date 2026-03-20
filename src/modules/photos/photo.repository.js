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

  findMany(skip, take) {
    return prisma.photo.findMany({ skip, take });
  }

  update(id, data) {
    return prisma.photo.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.photo.delete({ where: { id } });
  }
}
