const prisma = require("../config/prisma");

async function createPrintJob(tx, data) {
  return tx.printJob.create({ data });
}

async function getJobsByUser(userId) {
  return prisma.printJob.findMany({
    where: { userId },
    include: { printer: true },
    orderBy: { createdAt: "desc" }
  });
}

async function getJobsByOwner(ownerId) {
  return prisma.printJob.findMany({
    where: { printer: { ownerId } },
    include: { printer: true },
    orderBy: { createdAt: "desc" }
  });
}

async function updateJobStatusForOwner(jobId, ownerId, status) {
  return prisma.printJob.updateMany({
    where: { id: jobId, printer: { ownerId } },
    data: { status }
  });
}

async function countJobs() {
  return prisma.printJob.count();
}

async function countCompletedJobs() {
  return prisma.printJob.count({ where: { status: "COMPLETED" } });
}

async function listAllJobs() {
  return prisma.printJob.findMany({
    include: {
      printer: true,
      user: {
        select: {
          id: true,
          email: true,
          username: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

module.exports = {
  createPrintJob,
  getJobsByUser,
  getJobsByOwner,
  updateJobStatusForOwner,
  countJobs,
  countCompletedJobs,
  listAllJobs
};
