const bcrypt = require("bcryptjs");
const prisma = require("../core/prisma");

function randomBetween(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Alice",
        email: "alice@example.com",
        password: passwordHash,
        role: "ADMIN"
      },
      {
        name: "Bob",
        email: "bob@example.com",
        password: passwordHash,
        role: "ANALYST"
      },
      {
        name: "Carol",
        email: "carol@example.com",
        password: passwordHash,
        role: "VIEWER"
      }
    ],
    skipDuplicates: true
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ["alice@example.com", "bob@example.com", "carol@example.com"]
      }
    },
    select: {
      id: true,
      email: true
    }
  });

  const userMap = users.reduce((acc, user) => {
    acc[user.email] = user.id;
    return acc;
  }, {});

  const categories = [
    "Salary",
    "Freelance",
    "Rent",
    "Groceries",
    "Utilities",
    "Transport",
    "Dining",
    "Investments",
    "Subscriptions"
  ];

  const transactions = [];
  const now = new Date();
  const ownerEmails = Object.keys(userMap);

  for (let i = 0; i < 25; i += 1) {
    const monthsAgo = Math.floor(Math.random() * 6);
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
    const type = Math.random() > 0.45 ? "EXPENSE" : "INCOME";
    const email = ownerEmails[i % ownerEmails.length];

    transactions.push({
      userId: userMap[email],
      amount: type === "INCOME" ? randomBetween(250, 3200) : randomBetween(20, 850),
      type,
      category: categories[Math.floor(Math.random() * categories.length)],
      date,
      notes: `Seed transaction ${i + 1}`
    });
  }

  await prisma.transaction.createMany({
    data: transactions
  });

  console.log("Seed complete.");
  console.log("Credentials:");
  console.log("alice@example.com / password123 (ADMIN)");
  console.log("bob@example.com / password123 (ANALYST)");
  console.log("carol@example.com / password123 (VIEWER)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
