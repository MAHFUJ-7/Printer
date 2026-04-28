const prisma = require("../config/prisma");

async function createLedgerEntry(tx, data) {
  return tx.creditLedger.create({ data });
}

async function getUserLedger(userId, cursor, limit) {
  return prisma.creditLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });
}

async function aggregateRevenue() {
  const result = await prisma.creditLedger.aggregate({
    _sum: { amount: true },
    where: { type: "DEBIT" }
  });

  return result._sum.amount || 0;
}

module.exports = {
  createLedgerEntry,
  getUserLedger,
  aggregateRevenue
};
