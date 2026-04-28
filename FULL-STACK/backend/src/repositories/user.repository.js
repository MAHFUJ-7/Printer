const prisma = require("../config/prisma");

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  role: true,
  balance: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true
};

async function createUser(data) {
  return prisma.user.create({ data });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect
  });
}

async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect
  });
}

async function addCredits(tx, userId, amount) {
  return tx.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } }
  });
}

async function countUsers() {
  return prisma.user.count();
}

async function listUsers() {
  return prisma.user.findMany({
    select: safeUserSelect,
    orderBy: { createdAt: "desc" }
  });
}

async function updateUserRole(userId, role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: safeUserSelect
  });
}

module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  findById,
  updateUser,
  addCredits,
  countUsers,
  listUsers,
  updateUserRole
};
