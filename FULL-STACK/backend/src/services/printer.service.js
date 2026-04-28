const printerRepository = require("../repositories/printer.repository");
const userRepository = require("../repositories/user.repository");
const redis = require("../config/redis");
const ApiError = require("../utils/apiError");

function buildPrinterFilters(query) {
  const where = { status: "ONLINE" };

  if (query.model) {
    where.model = { contains: query.model, mode: "insensitive" };
  }

  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }

  if (query.minPrice || query.maxPrice) {
    where.pricePerPage = {};
    if (query.minPrice) {
      where.pricePerPage.gte = Number(query.minPrice);
    }
    if (query.maxPrice) {
      where.pricePerPage.lte = Number(query.maxPrice);
    }
  }

  return where;
}

function cacheKey(query, limit) {
  return `printers:online:${JSON.stringify({ query, limit })}`;
}

async function invalidateOnlinePrinterCache() {
  try {
    const keys = await redis.keys("printers:online:*");
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    // Cache invalidation is best-effort when Redis is unavailable.
  }
}

async function listPrinters(query) {
  const limit = Math.min(Number(query.limit || 20), 50);
  const cursor = query.cursor || null;
  const filters = buildPrinterFilters(query);

  const shouldUseCache = !cursor;
  const key = cacheKey(query, limit);

  if (shouldUseCache) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Continue without cache.
    }
  }

  const printers = await printerRepository.findMany(filters, cursor, limit + 1);
  const hasNextPage = printers.length > limit;
  const data = hasNextPage ? printers.slice(0, limit) : printers;

  const response = {
    data,
    nextCursor: hasNextPage ? data[data.length - 1].id : null
  };

  if (shouldUseCache) {
    try {
      await redis.setex(key, 60, JSON.stringify(response));
    } catch (error) {
      // Continue without cache.
    }
  }

  return response;
}

async function createPrinter(ownerId, payload) {
  const user = await userRepository.findById(ownerId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const printer = await printerRepository.createPrinter({
    ownerId,
    name: payload.name,
    location: payload.location,
    model: payload.model,
    capabilities: payload.capabilities,
    pricePerPage: payload.pricePerPage,
    priceColor: payload.priceColor,
    status: payload.status || "OFFLINE"
  });

  // Automatically upgrade STUDENT to PRINTER_OWNER when they add their first printer
  if (user.role === "STUDENT") {
    await userRepository.updateUserRole(ownerId, "PRINTER_OWNER");
  }

  await invalidateOnlinePrinterCache();

  return printer;
}

async function updatePrinterStatus(ownerId, id, status) {
  const result = await printerRepository.updateStatus(id, ownerId, status);
  if (result.count === 0) {
    throw new ApiError(404, "Printer not found or not owned by requester");
  }

  await invalidateOnlinePrinterCache();

  return { updated: true };
}

async function updatePrinterByOwner(ownerId, id, payload) {
  const result = await printerRepository.updateByOwner(id, ownerId, payload);
  if (result.count === 0) {
    throw new ApiError(404, "Printer not found or not owned by requester");
  }

  await invalidateOnlinePrinterCache();
  return { updated: true };
}

async function listOwnerPrinters(ownerId) {
  return printerRepository.listByOwner(ownerId);
}

async function listAllPrintersForAdmin() {
  return printerRepository.listAll();
}

async function updatePrinterStatusAsAdmin(id, status) {
  const printer = await printerRepository.updateStatusByAdmin(id, status);
  await invalidateOnlinePrinterCache();
  return printer;
}

async function deletePrinterAsAdmin(id) {
  await printerRepository.deleteById(id);
  await invalidateOnlinePrinterCache();
  return { deleted: true };
}

module.exports = {
  listPrinters,
  createPrinter,
  updatePrinterStatus,
  updatePrinterByOwner,
  listOwnerPrinters,
  listAllPrintersForAdmin,
  updatePrinterStatusAsAdmin,
  deletePrinterAsAdmin
};
