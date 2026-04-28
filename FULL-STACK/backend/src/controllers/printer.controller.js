const printerService = require("../services/printer.service");

async function listPrinters(req, res, next) {
  try {
    const result = await printerService.listPrinters(req.validated.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

async function createPrinter(req, res, next) {
  try {
    const printer = await printerService.createPrinter(req.user.sub, req.validated.body);
    return res.status(201).json({ status: "success", data: printer });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { status } = req.validated.body;
    const result = await printerService.updatePrinterStatus(req.user.sub, id, status);
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

async function listOwnerPrinters(req, res, next) {
  try {
    const data = await printerService.listOwnerPrinters(req.user.sub);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    return next(error);
  }
}

async function updatePrinter(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await printerService.updatePrinterByOwner(req.user.sub, id, req.validated.body);
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPrinters,
  createPrinter,
  updateStatus,
  listOwnerPrinters,
  updatePrinter
};
