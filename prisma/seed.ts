import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create subscription packages
  const packages = [
    { name: "1 Day", days: 1, price: 29, description: "Trial plan for 1 day" },
    { name: "3 Days", days: 3, price: 59, description: "Short-term access" },
    { name: "7 Days", days: 7, price: 149, description: "Weekly access" },
    { name: "15 Days", days: 15, price: 249, description: "Bi-weekly access" },
    { name: "30 Days", days: 30, price: 399, description: "Monthly access" },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg,
    });
  }

  console.log("✅ Created subscription packages");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@teer.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@teer.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user (admin@teer.com / admin123)");

  // Create sample houses
  const houses = [
    {
      name: "Shillong Teer",
      description: "Main Shillong Teer House",
      isActive: true,
    },
    {
      name: "Khanapara Teer",
      description: "Khanapara Teer House",
      isActive: true,
    },
    {
      name: "Juwai Teer",
      description: "Juwai Teer House",
      isActive: true,
    },
  ];

  for (const house of houses) {
    await prisma.house.upsert({
      where: { name: house.name },
      update: {},
      create: house,
    });
  }

  console.log("✅ Created sample houses");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
