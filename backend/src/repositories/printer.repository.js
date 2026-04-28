const prisma = require("../config/prisma");

async function createPrinter(data) {
  return prisma.printer.create({ data });
}

async function findById(id) {
  return prisma.printer.findUnique({ where: { id } });
}

async function findMany(filters, cursor, limit) {
  return prisma.printer.findMany({
    where: filters,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });
}

async function updateStatus(id, ownerId, status) {
  return prisma.printer.updateMany({
    where: { id, ownerId },
    data: { status }
  });
}

async function updateByOwner(id, ownerId, data) {
  return prisma.printer.updateMany({
    where: { id, ownerId },
    data
  });
}

async function listByOwner(ownerId) {
  return prisma.printer.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
}

async function listAll() {
  return prisma.printer.findMany({
    include: {
      owner: {
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

async function updateStatusByAdmin(id, status) {
  return prisma.printer.update({
    where: { id },
    data: { status }
  });
}

async function deleteById(id) {
  return prisma.printer.delete({ where: { id } });
}

module.exports = {
  createPrinter,
  findById,
  findMany,
  updateStatus,
  updateByOwner,
  listByOwner,
  listAll,
  updateStatusByAdmin,
  deleteById
};
