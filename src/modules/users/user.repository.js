import { prisma } from "../../config/prisma.js";

const safeSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  password: false,
};

export class UserRepository {
  create(data) {
    return prisma.user.create({ data, select: safeSelect });
  }

  findById(id) {
    return prisma.user.findUnique({ where: { id }, select: safeSelect });
  }

  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findMany(skip, take) {
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({ skip, take, select: safeSelect }),
      prisma.user.count(),
    ]);
    return { data, total };
  }

  update(id, data) {
    return prisma.user.update({ where: { id }, data, select: safeSelect });
  }

  delete(id) {
    return prisma.user.delete({ where: { id } });
  }
}
