const bcrypt = require("bcryptjs");
const prisma = require("../core/prisma");

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@finance.local";
  const name = process.env.DEFAULT_ADMIN_NAME || "Default Admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123456";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      password: passwordHash,
      role: "ADMIN",
      isActive: true
    },
    update: {
      name,
      password: passwordHash,
      role: "ADMIN",
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  console.log("Default admin is ready:");
  console.log(JSON.stringify(user, null, 2));
  console.log("Login password:", password);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
