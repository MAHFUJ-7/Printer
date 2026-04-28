const dotenv = require("dotenv");
dotenv.config();

const prisma = require("../src/config/prisma");

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    throw new Error("Usage: npm run promote-admin -- <user-id>");
  }

  const currentAdminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (currentAdminCount >= 3) {
    throw new Error("Admin limit reached (max 3)");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" }
  });

  console.log(`User promoted to ADMIN: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
