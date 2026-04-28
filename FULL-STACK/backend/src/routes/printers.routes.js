const express = require("express");
const printerController = require("../controllers/printer.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createPrinterSchema,
  listPrintersSchema,
  updateStatusSchema,
  updatePrinterSchema
} = require("../schemas/printer.schema");

const router = express.Router();

router.get("/", validate(listPrintersSchema), printerController.listPrinters);
router.post(
  "/",
  authenticate,
  authorize("PRINTER_OWNER"),
  validate(createPrinterSchema),
  printerController.createPrinter
);
router.get("/mine", authenticate, authorize("PRINTER_OWNER"), printerController.listOwnerPrinters);
router.patch(
  "/:id",
  authenticate,
  authorize("PRINTER_OWNER"),
  validate(updatePrinterSchema),
  printerController.updatePrinter
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("PRINTER_OWNER"),
  validate(updateStatusSchema),
  printerController.updateStatus
);

module.exports = router;
