const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

function notFound(req, res) {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
    code: 404
  });
}

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err instanceof ApiError) {
    return res.status(err.code).json({
      status: "error",
      message: err.message,
      code: err.code
    });
  }

  if (err?.name === "PrismaClientInitializationError") {
    return res.status(503).json({
      status: "error",
      message: "Database unavailable. Start PostgreSQL and retry.",
      code: 503
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    code: 500
  });
}

module.exports = {
  notFound,
  errorHandler
};
