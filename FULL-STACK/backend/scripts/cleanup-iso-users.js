const prisma = require("../src/config/prisma");

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: "iso" } },
        { username: { startsWith: "iso" } }
      ]
    },
    select: { id: true }
  });

  if (users.length === 0) {
    console.log("ISO_USERS_FOUND:0");
    return;
  }

  const ids = users.map((u) => u.id);

  await prisma.$transaction(async (tx) => {
    await tx.printJob.deleteMany({ where: { userId: { in: ids } } });
    await tx.printJob.deleteMany({ where: { printer: { ownerId: { in: ids } } } });
    await tx.printer.deleteMany({ where: { ownerId: { in: ids } } });
    await tx.creditLedger.deleteMany({ where: { userId: { in: ids } } });
    await tx.user.deleteMany({ where: { id: { in: ids } } });
  });

  const remaining = await prisma.user.count({
    where: {
      OR: [
        { email: { startsWith: "iso" } },
        { username: { startsWith: "iso" } }
      ]
    }
  });

  console.log(`ISO_USERS_REMAINING:${remaining}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
