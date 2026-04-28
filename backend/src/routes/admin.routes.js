const express = require("express");
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const {
	patchCreditsSchema,
	deletePrinterSchema,
	patchUserRoleSchema,
	patchPrinterStatusSchema
} = require("../schemas/admin.schema");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/stats", adminController.getStats);
router.get("/users", adminController.getUsers);
router.get("/printers", adminController.getPrinters);
router.get("/jobs", adminController.getJobs);
router.patch("/users/:id/credits", validate(patchCreditsSchema), adminController.patchCredits);
router.patch("/users/:id/role", validate(patchUserRoleSchema), adminController.patchUserRole);
router.patch("/printers/:id/status", validate(patchPrinterStatusSchema), adminController.patchPrinterStatus);
router.delete("/printers/:id", validate(deletePrinterSchema), adminController.deletePrinter);

module.exports = router;
