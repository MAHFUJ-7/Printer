const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@campusprint.com";
  const adminUsername = "admin";
  const adminPassword = "admin123";

  console.log("Checking for existing admin user...");
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { username: adminUsername },
        { role: "ADMIN" }
      ]
    }
  });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${existingAdmin.email} (${existingAdmin.username})`);
    return;
  }

  console.log("Creating default admin user...");
  const hashedPassword = await argon2.hash(adminPassword);
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
      balance: 1000.00,
      isVerified: true
    }
  });

  console.log(`Admin user created successfully!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error("Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
