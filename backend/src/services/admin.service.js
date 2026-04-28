const prisma = require("../config/prisma");
const userRepository = require("../repositories/user.repository");
const ledgerRepository = require("../repositories/ledger.repository");
const jobRepository = require("../repositories/job.repository");

async function getStats() {
  const [revenue, activeUsers, totalJobs, completedJobs] = await Promise.all([
    ledgerRepository.aggregateRevenue(),
    userRepository.countUsers(),
    jobRepository.countJobs(),
    jobRepository.countCompletedJobs()
  ]);

  const successRate = totalJobs === 0 ? 0 : (completedJobs / totalJobs) * 100;

  return {
    globalRevenue: revenue,
    activeUsers,
    jobSuccessRate: Number(successRate.toFixed(2))
  };
}

async function topUpCredits(adminId, userId, amount) {
  return prisma.$transaction(async (tx) => {
    const user = await userRepository.addCredits(tx, userId, amount);

    await ledgerRepository.createLedgerEntry(tx, {
      userId,
      amount,
      type: "CREDIT",
      description: `Admin Top-up by ${adminId}`
    });

    return user;
  });
}

async function listUsers() {
  return userRepository.listUsers();
}

async function listJobs() {
  return jobRepository.listAllJobs();
}

async function updateUserRole(userId, role) {
  return userRepository.updateUserRole(userId, role);
}

module.exports = {
  getStats,
  topUpCredits,
  listUsers,
  listJobs,
  updateUserRole
};
