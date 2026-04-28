const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const jobRepository = require("../repositories/job.repository");
const ledgerRepository = require("../repositories/ledger.repository");
const printerRepository = require("../repositories/printer.repository");
const ApiError = require("../utils/apiError");
const jobEvents = require("../events/job.events");

async function submitJob(studentId, payload) {
  const printer = await printerRepository.findById(payload.printerId);
  if (!printer) {
    throw new ApiError(404, "Printer not found");
  }

  if (printer.status !== "ONLINE") {
    throw new ApiError(400, "Printer is not online");
  }

  const price = payload.isColor && printer.priceColor 
    ? printer.priceColor 
    : printer.pricePerPage;

  const estimatedCost = new Prisma.Decimal(payload.pageCount).mul(price);

  const result = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.user.updateMany({
      where: {
        id: studentId,
        balance: { gte: estimatedCost }
      },
      data: {
        balance: { decrement: estimatedCost }
      }
    });

    if (updateResult.count !== 1) {
      throw new ApiError(400, "Insufficient balance");
    }

    const printJob = await jobRepository.createPrintJob(tx, {
      userId: studentId,
      printerId: payload.printerId,
      fileUrl: payload.fileUrl,
      pageCount: payload.pageCount,
      isColor: !!payload.isColor,
      totalCost: estimatedCost,
      status: "PENDING"
    });

    await ledgerRepository.createLedgerEntry(tx, {
      userId: studentId,
      amount: estimatedCost,
      type: "DEBIT",
      description: `Print Job ${printJob.id}`
    });

    return printJob;
  });

  jobEvents.emit("job.submitted", {
    jobId: result.id,
    userId: studentId,
    printerId: payload.printerId
  });

  return result;
}

async function getMyJobs(userId) {
  return jobRepository.getJobsByUser(userId);
}

async function getOwnerJobs(ownerId) {
  return jobRepository.getJobsByOwner(ownerId);
}

async function updateJobStatusByOwner(jobId, ownerId, status) {
  const result = await jobRepository.updateJobStatusForOwner(jobId, ownerId, status);
  if (result.count === 0) {
    throw new ApiError(404, "Job not found or not associated with owner printers");
  }

  jobEvents.emit("job.status.updated", {
    jobId,
    ownerId,
    status
  });

  return { updated: true };
}

module.exports = {
  submitJob,
  getMyJobs,
  getOwnerJobs,
  updateJobStatusByOwner
};
