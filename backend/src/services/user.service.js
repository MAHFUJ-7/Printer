const userRepository = require("../repositories/user.repository");
const ledgerRepository = require("../repositories/ledger.repository");
const ApiError = require("../utils/apiError");

async function getMyProfile(userId) {
  return userRepository.findById(userId);
}

async function updateProfile(userId, payload) {
  const { username, firstName, lastName } = payload;

  if (username) {
    const existing = await userRepository.findByUsername(username);
    if (existing && existing.id !== userId) {
      throw new ApiError(409, "Username already in use");
    }
  }

  return userRepository.updateUser(userId, {
    username,
    firstName,
    lastName
  });
}

async function upgradeToPrinterOwner(userId) {
  const user = await userRepository.findById(userId);
  if (user.role === "ADMIN") {
    throw new ApiError(400, "Admins cannot be downgraded to Printer Owner via this endpoint");
  }
  
  return userRepository.updateUserRole(userId, "PRINTER_OWNER");
}

async function getMyTransactions(userId, cursor, limit) {
  const records = await ledgerRepository.getUserLedger(userId, cursor, limit + 1);

  const hasNextPage = records.length > limit;
  const data = hasNextPage ? records.slice(0, limit) : records;

  return {
    data,
    nextCursor: hasNextPage ? data[data.length - 1].id : null
  };
}

module.exports = {
  getMyProfile,
  updateProfile,
  upgradeToPrinterOwner,
  getMyTransactions
};
