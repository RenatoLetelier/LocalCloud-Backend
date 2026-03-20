import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("admin1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@localcloud.local" },
    update: {},
    create: {
      email: "admin@localcloud.local",
      username: "admin",
      password: passwordHash,
      role: "admin",
    },
  });

  console.log("Seed completed. Default admin: admin@localcloud.local / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
