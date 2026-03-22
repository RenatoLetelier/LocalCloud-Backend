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

  findManyByPaths(paths) {
    return prisma.photo.findMany({ where: { path: { in: paths } } });
  }

  findMany(skip, take) {
    return prisma.photo.findMany({ skip, take });
  }

  upsertByPath(path, create, update) {
    return prisma.photo.upsert({ where: { path }, create, update });
  }

  update(id, data) {
    return prisma.photo.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.photo.delete({ where: { id } });
  }
}
