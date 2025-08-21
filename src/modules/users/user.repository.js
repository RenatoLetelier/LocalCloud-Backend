import { prisma } from "../../config/prisma.js";

export class UserRepository {
  create(data) {
    return prisma.user.create({ data });
  }

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  findMany(skip, take) {
    return prisma.user.findMany({ skip, take });
  }

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  // soft delete
  delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
