const adminService = require("../services/admin.service");
const printerService = require("../services/printer.service");

async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    return res.status(200).json({ status: "success", data: stats });
  } catch (error) {
    return next(error);
  }
}

async function patchCredits(req, res, next) {
  try {
    const user = await adminService.topUpCredits(
      req.user.sub,
      req.validated.params.id,
      req.validated.body.amount
    );
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return next(error);
  }
}

async function deletePrinter(req, res, next) {
  try {
    const result = await printerService.deletePrinterAsAdmin(req.validated.params.id);
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    return res.status(200).json({ status: "success", data: users });
  } catch (error) {
    return next(error);
  }
}

async function getJobs(req, res, next) {
  try {
    const jobs = await adminService.listJobs();
    return res.status(200).json({ status: "success", data: jobs });
  } catch (error) {
    return next(error);
  }
}

async function getPrinters(req, res, next) {
  try {
    const printers = await printerService.listAllPrintersForAdmin();
    return res.status(200).json({ status: "success", data: printers });
  } catch (error) {
    return next(error);
  }
}

async function patchUserRole(req, res, next) {
  try {
    const updated = await adminService.updateUserRole(req.validated.params.id, req.validated.body.role);
    return res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    return next(error);
  }
}

async function patchPrinterStatus(req, res, next) {
  try {
    const updated = await printerService.updatePrinterStatusAsAdmin(
      req.validated.params.id,
      req.validated.body.status
    );
    return res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  patchCredits,
  deletePrinter,
  getUsers,
  getJobs,
  getPrinters,
  patchUserRole,
  patchPrinterStatus
};
