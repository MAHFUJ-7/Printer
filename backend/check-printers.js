const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const printers = await prisma.printer.findMany();
  console.log("Printers in database:");
  console.log(JSON.stringify(printers, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
